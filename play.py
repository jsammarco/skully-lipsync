from audioplayer import AudioPlayer

# Playback stops when the object is destroyed (GC'ed), so save a reference to the object for non-blocking playback.
AudioPlayer("C:/Users/Joe/Downloads/output5stem.mp3/queen/vocals.wav").play(block=True)