import * as React from 'react';
import * as CommonActions from './CommonActions';
import EnsureSingleNavigator from './EnsureSingleNavigator';
import NavigationBuilderContext from './NavigationBuilderContext';
import useFocusedListeners from './useFocusedListeners';
import useDevTools from './useDevTools';

import {
  Route,
  NavigationState,
  InitialState,
  PartialState,
  NavigationAction,
  NavigationContainerRef,
  NavigationContainerProps,
} from './types';

type State = NavigationState | PartialState<NavigationState> | undefined;

const MISSING_CONTEXT_ERROR =
  "We couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?";

export const NavigationStateContext = React.createContext<{
  state?: NavigationState | PartialState<NavigationState>;
  getState: () => NavigationState | PartialState<NavigationState> | undefined;
  setState: (state: NavigationState | undefined) => void;
  key?: string;
  performTransaction: (action: () => void) => void;
}>({
  get getState(): any {
    throw new Error(MISSING_CONTEXT_ERROR);
  },
  get setState(): any {
    throw new Error(MISSING_CONTEXT_ERROR);
  },
  get performTransaction(): any {
    throw new Error(MISSING_CONTEXT_ERROR);
  },
});

/**
 * Remove `key` and `routeNames` from the state objects recursively to get partial state.
 *
 * @param state Initial state object.
 */
const getPartialState = (
  state: InitialState | undefined
): PartialState<NavigationState> | undefined => {
  if (state === undefined) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key, routeNames, ...partialState } = state;

  // @ts-ignore
  return {
    ...partialState,
    stale: true,
    routes: state.routes.map(route => {
      if (route.state === undefined) {
        return route as Route<string> & {
          state?: PartialState<NavigationState>;
        };
      }

      return { ...route, state: getPartialState(route.state) };
    }),
  };
};

/**
 * Container component which holds the navigation state.
 * This should be rendered at the root wrapping the whole app.
 *
 * @param props.initialState Initial state object for the navigation tree.
 * @param props.onStateChange Callback which is called with the latest navigation state when it changes.
 * @param props.children Child elements to render the content.
 * @param props.ref Ref object which refers to the navigation object containing helper methods.
 */
const Container = React.forwardRef(function NavigationContainer(
  { initialState, onStateChange, children }: NavigationContainerProps,
  ref: React.Ref<NavigationContainerRef>
) {
  const [state, setNavigationState] = React.useState<State>(() =>
    getPartialState(initialState)
  );

  const { listeners, addListener: addFocusedListener } = useFocusedListeners();

  const dispatch = (
    action: NavigationAction | ((state: NavigationState) => NavigationAction)
  ) => {
    listeners[0](navigation => navigation.dispatch(action));
  };

  const canGoBack = () => {
    const { result, handled } = listeners[0](navigation =>
      navigation.canGoBack()
    );

    if (handled) {
      return result;
    } else {
      return false;
    }
  };

  React.useImperativeHandle(ref, () => ({
    ...(Object.keys(CommonActions) as Array<keyof typeof CommonActions>).reduce<
      any
    >((acc, name) => {
      acc[name] = (...args: any[]) =>
        dispatch(
          // eslint-disable-next-line import/namespace
          CommonActions[name](
            // @ts-ignore
            ...args
          )
        );
      return acc;
    }, {}),
    resetRoot: (state: PartialState<NavigationState> | NavigationState) => {
      trackAction('@@RESET_ROOT');
      setNavigationState(state);
    },
    dispatch,
    canGoBack,
  }));

  const navigationStateRef = React.useRef<State>();
  const transactionStateRef = React.useRef<State | null>(null);
  const isTransactionActiveRef = React.useRef<boolean>(false);
  const isFirstMountRef = React.useRef<boolean>(true);
  const skipTrackingRef = React.useRef<boolean>(false);

  const reset = React.useCallback((state: NavigationState) => {
    skipTrackingRef.current = true;
    setNavigationState(state);
  }, []);

  const { trackState, trackAction } = useDevTools({
    name: '@react-navigation',
    reset,
    state,
  });

  const builderContext = React.useMemo(
    () => ({
      addFocusedListener,
      trackAction,
    }),
    [addFocusedListener, trackAction]
  );

  const performTransaction = React.useCallback((callback: () => void) => {
    if (isTransactionActiveRef.current) {
      throw new Error(
        "Only one transaction can be active at a time. Did you accidentally nest 'performTransaction'?"
      );
    }

    setNavigationState((navigationState: State) => {
      isTransactionActiveRef.current = true;
      transactionStateRef.current = navigationState;

      callback();

      isTransactionActiveRef.current = false;

      return transactionStateRef.current;
    });
  }, []);

  const getState = React.useCallback(
    () =>
      transactionStateRef.current !== null
        ? transactionStateRef.current
        : navigationStateRef.current,
    []
  );

  const setState = React.useCallback((navigationState: State) => {
    if (transactionStateRef.current === null) {
      throw new Error(
        "Any 'setState' calls need to be done inside 'performTransaction'"
      );
    }

    transactionStateRef.current = navigationState;
  }, []);

  const context = React.useMemo(
    () => ({
      state,
      performTransaction,
      getState,
      setState,
    }),
    [getState, performTransaction, setState, state]
  );

  React.useEffect(() => {
    if (skipTrackingRef.current) {
      skipTrackingRef.current = false;
    } else {
      trackState(state);
    }

    navigationStateRef.current = state;
    transactionStateRef.current = null;

    if (!isFirstMountRef.current && onStateChange) {
      onStateChange(state);
    }

    isFirstMountRef.current = false;
  }, [state, onStateChange, trackState]);

  return (
    <NavigationBuilderContext.Provider value={builderContext}>
      <NavigationStateContext.Provider value={context}>
        <EnsureSingleNavigator>{children}</EnsureSingleNavigator>
      </NavigationStateContext.Provider>
    </NavigationBuilderContext.Provider>
  );
});

export default Container;
