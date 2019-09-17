import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import {
  createNavigator,
  useNavigationBuilder,
  DefaultNavigatorOptions,
  CommonActions,
  Descriptor,
  ParamListBase,
  NavigationHelpers,
  Route,
  NavigationProp,
} from '@react-navigation/core';

import {
  StackRouter,
  StackNavigationState,
  StackRouterOptions,
} from '@react-navigation/routers';

import {
  // @ts-ignore
  ScreenStack,
  useScreens,
  Screen,
  // @ts-ignore
  ScreenStackHeaderConfig,
  // @ts-ignore
  ScreenStackHeaderLeftView,
  // @ts-ignore
  ScreenStackHeaderRightView,
  // @ts-ignore
  ScreenStackHeaderTitleView,
  // @ts-ignore
  // eslint-disable-next-line import/no-unresolved
} from 'react-native-screens';

export type NativeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = NavigationProp<
  ParamList,
  RouteName,
  StackNavigationState,
  StackNavigationOptions,
  {}
> & {
  /**
   * Push a new screen onto the stack.
   *
   * @param name Name of the route for the tab.
   * @param [params] Params object for the route.
   */
  push<RouteName extends keyof ParamList>(
    ...args: ParamList[RouteName] extends (undefined | any)
      ? [RouteName] | [RouteName, ParamList[RouteName]]
      : [RouteName, ParamList[RouteName]]
  ): void;

  /**
   * Pop a screen from the stack.
   */
  pop(count?: number): void;

  /**
   * Pop to the first route in the stack, dismissing all other screens.
   */
  popToTop(): void;
};
export type StackNavigationHelpers = NavigationHelpers<ParamListBase, {}>;

export type HeaderMode = 'float' | 'screen' | 'none';

export type StackNavigationConfig = {
  mode?: 'card' | 'modal';
  headerMode?: HeaderMode;
};

export type HeaderOptions = {
  /**
   * String to be used by the header.
   * Defaults to scene `title`.
   */
  headerTitle?: string | ((options: StackNavigationOptions) => React.ReactNode);
  /**
   * Style object for the title component.
   */
  headerBackTitle?: string;
  /**
   * Title string used by the back button on iOS, or `null` to disable label. Defaults to the previous scene's `headerTitle`.
   */
  headerStyle?: StyleProp<ViewStyle>;
  /**
   * Defaults to `false`. If `true`, the header will not have a background unless you explicitly provide it with `headerBackground`.
   * The header will also float over the screen so that it overlaps the content underneath.
   * This is useful if you want to render a semi-transparent header or a blurred background.
   */
  headerTransparent?: boolean;
  /**
   * iOS only
   * Indicating whether the navigation bar is translucent
   */
  translucent?: boolean;
  /**
   * iOS only
   * Set native property to prefer large title header (like in iOS seeting)
   */

  largeTitle?: boolean;
  /**
   * Function which returns a React Element to display on the left side of the header.
   */
  headerLeft?: (options: StackNavigationOptions) => React.ReactNode;
  /**
   * Function which returns a React Element to display on the right side of the header.
   */
  headerRight?: (options: StackNavigationOptions) => React.ReactNode;
  /**
   * Tint color for the header.
   */
  headerTintColor?: string;
  titleFontFamily?: string;
  titleFontSize?: number;
  backTitleFontSize?: number;
  backTitleFontFamily?: string;
};

export type StackNavigationOptions = HeaderOptions & {
  /**
   * String that can be displayed in the header as a fallback for `headerTitle`.
   */
  title?: string;
  /**
   * Setting to `false` hides header.
   */
  showHeader?: boolean;
  /**
   * Whether you can use gestures to dismiss this screen. Defaults to `true` on iOS, `false` on Android.
   */
  gestureEnabled?: boolean;
};

type Props = DefaultNavigatorOptions<StackNavigationOptions> &
  StackRouterOptions &
  StackNavigationConfig;

export type StackDescriptor = Descriptor<
  ParamListBase,
  string,
  StackNavigationState,
  StackNavigationOptions
>;

const _removeScene = (navigation: StackNavigationHelpers) => {
  navigation.dispatch(CommonActions.goBack());
};

const _renderHeaderConfig = (
  descriptor: StackDescriptor,
  config: StackNavigationConfig,
) => {
  const { options } = descriptor;
  const { headerMode } = config;

  const {
    title,
    headerTitle,
    headerStyle,
    headerBackTitle,
    headerTintColor,
    gestureEnabled,
    largeTitle,
    translucent,
    titleFontFamily,
    titleFontSize,
    backTitleFontSize,
    backTitleFontFamily,
    headerTransparent,
  } = options;

  const headerOptions = {
    translucent: translucent === undefined ? false : translucent,
    title: typeof headerTitle === 'string' ? headerTitle : title,
    titleFontFamily,
    titleColor: headerTintColor,
    titleFontSize,
    backTitle: headerBackTitle,
    backTitleFontFamily,
    backTitleFontSize,
    color: headerTintColor,
    gestureEnabled: gestureEnabled === undefined ? true : gestureEnabled,
    largeTitle,
    backgroundColor: undefined,
    children: undefined,
  };

  const hasHeader = headerMode !== 'none' && !headerTransparent;
  if (!hasHeader) {
    return <ScreenStackHeaderConfig {...headerOptions} hidden />;
  }

  if (headerStyle !== undefined) {
    headerOptions.backgroundColor =
      // @ts-ignore
      headerStyle && headerStyle.backgroundColor;
  }

  const children = [];

  if (options.headerLeft !== undefined) {
    children.push(
      <ScreenStackHeaderLeftView key="left">
        {options.headerLeft(options)}
      </ScreenStackHeaderLeftView>
    );
  }
  // } else if (options.headerBackImage !== undefined) {
  //   const goBack = () => {
  //     // Go back on next tick because button ripple effect needs to happen on Android
  //     requestAnimationFrame(() => {
  //       descriptor.navigation.goBack();
  //     });
  //   };
  //
  //   children.push(
  //     <ScreenStackHeaderLeftView key="left">
  //       <HeaderBackButton
  //         onPress={goBack}
  //         // pressColorAndroid={options.headerPressColorAndroid}
  //         // tintColor={options.headerTintColor}
  //         // backImage={options.headerBackImage}
  //         // title={options.backButtonTitle}
  //         // truncatedTitle={options.truncatedBackButtonTitle}
  //         // backTitleVisible={this.props.backTitleVisible}
  //         // titleStyle={options.headerBackTitleStyle}
  //         // layoutPreset={this.props.layoutPreset}
  //       />
  //     </ScreenStackHeaderLeftView>
  //   );
  // }

  if (options.headerTitle && typeof options.headerTitle === 'function') {
    children.push(
      <ScreenStackHeaderTitleView key="title">
        {options.headerTitle(options)}
      </ScreenStackHeaderTitleView>
    );
  }

  if (options.headerRight) {
    children.push(
      <ScreenStackHeaderRightView key="right">
        {options.headerRight(options)}
      </ScreenStackHeaderRightView>
    );
  }

  if (children.length > 0) {
    // @ts-ignore
    headerOptions.children = children;
  }

  return <ScreenStackHeaderConfig {...headerOptions} />;
};

useScreens(true)

const _renderScene = (
  descriptor: StackDescriptor,
  config: StackNavigationConfig,
  navigation: StackNavigationHelpers,
  route: Route<string>
) => {
  const { mode } = config;

  // TODO handle transparentModal
  const stackPresentation = mode === 'modal' ? 'modal' : 'push';

  if (!descriptor) {
    return null;
  }

  return (
    // @ts-ignore
    <Screen
      key={`native_stack_screen_${route.key}`}
      style={StyleSheet.absoluteFill}
      stackPresentation={stackPresentation}
      onDismissed={() => _removeScene(navigation)}
    >
      <>
        {_renderHeaderConfig(descriptor, config)}
        {descriptor.render()}
      </>
    </Screen>
  );
};

function NativeStackNavigator(props: Props) {
  const { initialRouteName, children, screenOptions } = props;
  const { state, descriptors, navigation } = useNavigationBuilder<
    StackNavigationState,
    StackRouterOptions,
    StackNavigationOptions,
    {}
  >(StackRouter, {
    initialRouteName,
    children,
    screenOptions,
  });

  return (
    <ScreenStack style={styles.scenes}>
      {state.routes.map(route =>
        _renderScene(descriptors[route.key], props, navigation, route)
      )}
    </ScreenStack>
  );
}

const styles = StyleSheet.create({
  scenes: { flex: 1 },
});

export default createNavigator(NativeStackNavigator);
