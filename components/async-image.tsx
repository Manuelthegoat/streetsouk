import {
  Image as ExpoImage,
  type ImageBackgroundProps as ExpoImageBackgroundProps,
  type ImageProps as ExpoImageProps,
  type ImageSource,
} from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type { ImageSource };

type ImageStateProps = Pick<ExpoImageProps, "source" | "onLoad" | "onError" | "onLoadStart">;

function useImageState({ source, onLoad, onError, onLoadStart }: ImageStateProps) {
  const [loading, setLoading] = useState(source != null);
  const [failed, setFailed] = useState(false);

  function handleLoadStart() {
    setFailed(false);
    setLoading(true);
    onLoadStart?.();
  }

  function handleLoad(event: Parameters<NonNullable<ExpoImageProps["onLoad"]>>[0]) {
    setLoading(false);
    onLoad?.(event);
  }

  function handleError(event: Parameters<NonNullable<ExpoImageProps["onError"]>>[0]) {
    setLoading(false);
    setFailed(true);
    onError?.(event);
  }

  return {
    loading,
    failed,
    handleLoadStart,
    handleLoad,
    handleError,
  };
}

function ImageStatus({ loading, failed }: { loading: boolean; failed: boolean }) {
  if (loading) {
    return (
      <View pointerEvents="none" style={s.status}>
        <ActivityIndicator size="small" color="#39FF14" />
      </View>
    );
  }
  if (failed) {
    return <View pointerEvents="none" style={s.status} />;
  }
  return null;
}

export function Image(props: ExpoImageProps) {
  const { source, style, onLoad, onError, onLoadStart, ...imageProps } = props;
  const state = useImageState({ source, onLoad, onError, onLoadStart });

  return (
    <View style={[style as StyleProp<ViewStyle>, s.frame]}>
      <ExpoImage
        {...imageProps}
        source={source}
        style={StyleSheet.absoluteFill}
        onLoadStart={state.handleLoadStart}
        onLoad={state.handleLoad}
        onError={state.handleError}
      />
      <ImageStatus loading={state.loading} failed={state.failed} />
    </View>
  );
}

export function ImageBackground(props: ExpoImageBackgroundProps) {
  const {
    source,
    style,
    imageStyle,
    children,
    onLoad,
    onError,
    onLoadStart,
    ...imageProps
  } = props;
  const state = useImageState({ source, onLoad, onError, onLoadStart });

  return (
    <View style={style}>
      <ExpoImage
        {...imageProps}
        source={source}
        style={[StyleSheet.absoluteFill, imageStyle]}
        onLoadStart={state.handleLoadStart}
        onLoad={state.handleLoad}
        onError={state.handleError}
      />
      <ImageStatus loading={state.loading} failed={state.failed} />
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  status: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 24, 16, 0.72)",
  },
});
