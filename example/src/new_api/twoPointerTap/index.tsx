import React, { useState } from 'react';
import { Text, StyleSheet, View, ScrollView, Button } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function Home() {
  const [log, setLog] = useState<string[]>([]);

  const tap = Gesture.Tap()
    .minPointers(2)
    .runOnJS(true)
    .onBegin((event) => {
      setLog((prev) => [`onBegin: ${JSON.stringify({ event })}`, ...prev]);
    })
    .onStart((event) => {
      setLog((prev) => [`onStart: ${JSON.stringify({ event })}`, ...prev]);
    })
    .onEnd((event, success) => {
      setLog((prev) => [
        `onEnd: ${JSON.stringify({ event, success })}`,
        ...prev,
      ]);
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tap}>
        <View style={styles.home}>
          <ScrollView>
            <Button title="Reset" onPress={() => setLog([])} />
            {log.map((line, i) => (
              <Text key={i} style={[styles.log, i === 0 && styles.logNew]}>
                {line}
              </Text>
            ))}
          </ScrollView>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  home: {
    width: '100%',
    height: '100%',
  },
  log: {
    fontSize: 12,
    color: 'grey',
    padding: 5,
  },
  logNew: {
    backgroundColor: '#e6ffec',
    color: 'black',
  },
});
