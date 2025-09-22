import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRef, useState } from 'react';
import { Audio, Video, ResizeMode } from 'expo-av';
import videoLocal from './assets/videoplayback.mp4';

export default function App() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useRemote, setUseRemote] = useState(false);
  const [status, setStatus] = useState({});

  const source = useRemote
    ? { uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    : videoLocal;

  async function ensureAudioMode() {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
  }

  async function handlePlayPause() {
    if (!videoRef.current) return;
    await ensureAudioMode();
    const current = await videoRef.current.getStatusAsync();
    if (current.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  }

  async function handleStop() {
    if (!videoRef.current) return;
    await videoRef.current.stopAsync();
    setIsPlaying(false);
  }

  async function handleSeek(secondsDelta) {
    if (!videoRef.current) return;
    const current = await videoRef.current.getStatusAsync();
    if (!current.isLoaded) return;
    const newPos = Math.max(0, Math.min((current.positionMillis + secondsDelta * 1000), current.durationMillis ?? Infinity));
    await videoRef.current.setPositionAsync(newPos);
  }

  function toggleSource() {
    setUseRemote((prev) => !prev);
    setIsPlaying(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceso a Multimedia - Video (Expo)</Text>

      <View style={styles.playerWrapper}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={source}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={(s) => {
            setStatus(s);
            if ('isPlaying' in s) setIsPlaying(Boolean(s.isPlaying));
          }}
        />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.button} onPress={() => handleSeek(-10)}>
          <Text style={styles.buttonText}>{'<'} 10s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
          <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleSeek(10)}>
          <Text style={styles.buttonText}>10s {'>'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, styles.toggle]} onPress={toggleSource}>
        <Text style={styles.buttonText}>Fuente: {useRemote ? 'Remota' : 'Local'}</Text>
      </TouchableOpacity>

      {'durationMillis' in status && 'positionMillis' in status ? (
        <Text style={styles.time}>
          {Math.floor((status.positionMillis || 0) / 1000)}s / {Math.floor((status.durationMillis || 0) / 1000)}s
        </Text>
      ) : null}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 12,
  },
  playerWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  toggle: {
    marginTop: 10,
    backgroundColor: '#43a047',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  time: {
    color: '#ddd',
    marginTop: 8,
  },
});
