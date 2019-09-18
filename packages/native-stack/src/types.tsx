import {
  DefaultNavigatorOptions,
  Descriptor,
  NavigationHelpers,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/core';
import {
  StackNavigationState,
  StackRouterOptions,
} from '@react-navigation/routers';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type NativeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = NavigationProp<
  ParamList,
  RouteName,
  StackNavigationState,
  NativeStackNavigationOptions,
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
  headerTitle?: string | ((options: NativeStackNavigationOptions) => React.ReactNode);
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
  headerLeft?: (options: NativeStackNavigationOptions) => React.ReactNode;
  /**
   * Function which returns a React Element to display on the right side of the header.
   */
  headerRight?: (options: NativeStackNavigationOptions) => React.ReactNode;
  /**
   * Tint color for the header.
   */
  headerTintColor?: string;
  titleFontFamily?: string;
  titleFontSize?: number;
  backTitleFontSize?: number;
  backTitleFontFamily?: string;
};

export type NativeStackNavigationOptions = HeaderOptions & {
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
  /**
   * Whether to use a transparent background for the card instead of a white one.
   * This is useful to implement things like modal dialogs where the previous scene should still be visible underneath the current one.
   * Defaults to `false`.
   *
   * If you use [`react-native-screens`](https://github.com/kmagiera/react-native-screens),
   * you should also specify `mode: 'modal'` in the stack view config so previous screens aren't detached.
   */
  cardTransparent?: boolean;
};

export type Props = DefaultNavigatorOptions<NativeStackNavigationOptions> &
  StackRouterOptions &
  StackNavigationConfig;

export type StackDescriptor = Descriptor<
  ParamListBase,
  string,
  StackNavigationState,
  NativeStackNavigationOptions
>;
