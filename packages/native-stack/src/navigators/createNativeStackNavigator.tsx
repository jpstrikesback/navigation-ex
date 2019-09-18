import React from 'react';
import { StyleSheet } from 'react-native';
import {
  createNavigator,
  useNavigationBuilder,
  CommonActions,
  Route,
} from '@react-navigation/core';

import {
  StackRouter,
  StackNavigationState,
  StackRouterOptions,
} from '@react-navigation/routers';

import {
  // @ts-ignore
  ScreenStack,
  screensEnabled,
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
import {
  Props,
  StackDescriptor,
  StackNavigationConfig,
  StackNavigationHelpers,
  NativeStackNavigationOptions,
} from '../types';

function removeScene(navigation: StackNavigationHelpers) {
  return navigation.dispatch(CommonActions.goBack());
}

function renderHeaderConfig(
  descriptor: StackDescriptor,
  config: StackNavigationConfig
) {
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
    // @ts-ignore
    backgroundColor: headerStyle && headerStyle.backgroundColor,
  };

  const hasHeader = headerMode !== 'none' && !headerTransparent;
  if (!hasHeader) {
    return <ScreenStackHeaderConfig {...headerOptions} hidden />;
  }

  const children = [];

  if (options.headerLeft !== undefined) {
    children.push(
      <ScreenStackHeaderLeftView key="left">
        {options.headerLeft(options)}
      </ScreenStackHeaderLeftView>
    );
  }
  // TODO headerBackImage

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

  return <ScreenStackHeaderConfig {...headerOptions} children={children} />;
}

useScreens(true);

function renderScene(
  descriptor: StackDescriptor,
  config: StackNavigationConfig,
  navigation: StackNavigationHelpers,
  route: Route<string>
) {
  const { mode } = config;

  const stackPresentation =
    mode === 'modal'
      ? descriptor.options.cardTransparent
        ? 'modal'
        : 'transparentModal'
      : 'push';

  if (!descriptor) {
    return null;
  }

  return (
    // @ts-ignore
    <Screen
      key={`native_stack_screen_${route.key}`}
      style={StyleSheet.absoluteFill}
      stackPresentation={stackPresentation}
      onDismissed={() => removeScene(navigation)}
    >
      <>
        {renderHeaderConfig(descriptor, config)}
        {descriptor.render()}
      </>
    </Screen>
  );
}

function NativeStackNavigator(props: Props) {
  if (!screensEnabled()) {
    throw new Error(
      'Native stack is only available if React Native Screens are enabled'
    );
  }
  const { initialRouteName, children, screenOptions } = props;
  const { state, descriptors, navigation } = useNavigationBuilder<
    StackNavigationState,
    StackRouterOptions,
    NativeStackNavigationOptions,
    {}
  >(StackRouter, {
    initialRouteName,
    children,
    screenOptions,
  });

  return (
    <ScreenStack style={styles.scenes}>
      {state.routes.map(route =>
        renderScene(descriptors[route.key], props, navigation, route)
      )}
    </ScreenStack>
  );
}

const styles = StyleSheet.create({
  scenes: { flex: 1 },
});

export default createNavigator(NativeStackNavigator);
