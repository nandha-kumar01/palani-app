import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  StatusBar,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { apiService, Song as ApiSong } from '../services/api';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

interface Song {
  id: string;
  _id?: string;
  title: string;
  artist: string;
  description?: string;
  duration: number;
  thumbnail?: string;
  thumbnailUrl?: string;
  category?: string;
  audioUrl?: string;
  album?: string;
  genre?: string;
  releaseDate?: string;
  lyrics?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const { width, height } = Dimensions.get('window');

interface MusicScreenProps {
  navigation: any;
}



export default function MusicScreen({ navigation }: MusicScreenProps) {
  const { language } = useApp();
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(45); // Demo current time
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showMenu, setShowMenu] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [isLoading, setIsLoading] = useState(false);

  
  // Animated values for wave bars and play button
  const animValues = [
    useState(() => new Animated.Value(0.3))[0],
    useState(() => new Animated.Value(0.7))[0],
    useState(() => new Animated.Value(0.5))[0],
    useState(() => new Animated.Value(0.9))[0],
  ];
  const playButtonScale = useState(() => new Animated.Value(1))[0];
  const thumbnailRotation = useState(() => new Animated.Value(0))[0];
  
  // Animated values for swipe gesture
  const translateX = useState(() => new Animated.Value(0))[0];
  const opacity = useState(() => new Animated.Value(1))[0];

  // Note: Current time is now handled by the audio status listener only

  // Animate wave bars and play button when playing
  useEffect(() => {
    if (isPlaying) {
      // Wave bar animations
      const animations = animValues.map((animValue, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + index * 100,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 400 + index * 50,
              useNativeDriver: false,
            }),
          ])
        )
      );
      
      // Play button pulse animation
      const playButtonAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(playButtonScale, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(playButtonScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      // Thumbnail rotation animation
      const thumbnailRotationAnimation = Animated.loop(
        Animated.timing(thumbnailRotation, {
          toValue: 1,
          duration: 8000, // 8 seconds for full rotation
          useNativeDriver: true,
        })
      );
      
      animations.forEach(anim => anim.start());
      playButtonAnimation.start();
      thumbnailRotationAnimation.start();
      
      return () => {
        animations.forEach(anim => anim.stop());
        playButtonAnimation.stop();
        thumbnailRotationAnimation.stop();
      };
    } else {
      // Reset to default values when stopped
      animValues.forEach((animValue, index) => {
        Animated.timing(animValue, {
          toValue: [0.3, 0.7, 0.5, 0.9][index],
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
      
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Reset thumbnail rotation
      Animated.timing(thumbnailRotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  const handlePlayPause = async () => {
    try {
      if (!currentSong) return;

      if (status.playing) {
        // Pause the current playback
        player.pause();
        setIsPlaying(false);
      } else if (status.isLoaded) {
        // Resume playback
        player.play();
        setIsPlaying(true);
      } else if (currentSong.audioUrl) {
        // Load new audio source
        setIsLoading(true);
        player.replace(currentSong.audioUrl);
        player.volume = volume;
        
        setTimeout(() => {
          player.play();
          setIsPlaying(true);
          setIsLoading(false);
        }, 100);
        
        console.log('🔊 Audio loading with volume:', volume);
      } else {
        // No audio URL available
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('🚨 Audio playback error:', error);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Current song:', currentSong?.title);
      console.error('🚨 Audio URL:', currentSong?.audioUrl);
      
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleNextSong = async () => {
    if (currentSong && songs.length > 0) {
      const currentIndex = songs.findIndex(s => s.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      const nextSong = songs[nextIndex];
      
      console.log('🔄 Playing next song:', nextSong.title);
      await playSong(nextSong);
    }
  };

  const handlePreviousSong = async () => {
    if (currentSong && songs.length > 0) {
      const currentIndex = songs.findIndex(s => s.id === currentSong.id);
      const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
      const prevSong = songs[prevIndex];
      
      console.log('🔄 Playing previous song:', prevSong.title);
      await playSong(prevSong);
    }
  };

  const handleSongSelect = async (song: any) => {
    await playSong(song);
  };

  const handlePlayButtonPress = async (song: any) => {
    setShowFullPlayer(true); // Open full-screen player first
    await playSong(song); // Then play the song
  };

  const openFullPlayer = () => {
    if (currentSong) {
      setShowFullPlayer(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // Remove decimal completely
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

    const handleVolumeChange = async (direction: 'up' | 'down') => {
    let newVolume;
    if (direction === 'up') {
      newVolume = Math.min(1, volume + 0.1);
    } else {
      newVolume = Math.max(0, volume - 0.1);
    }
    
    setVolume(newVolume);
    console.log('🔊 Volume changed to:', newVolume);
    
    // Update actual audio volume
    try {
      player.volume = newVolume;
      console.log('🔊 Audio volume updated to:', newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  // PanResponder for swipe gestures on mini player
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // Start gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      translateX.setValue(gestureState.dx);
      // Fade out as user swipes with better visual feedback
      const progress = Math.abs(gestureState.dx) / 120;
      opacity.setValue(1 - Math.min(progress, 0.7));
    },
    onPanResponderRelease: (evt, gestureState) => {
      const swipeThreshold = 80; // Reduced threshold for easier swiping
      const velocity = Math.abs(gestureState.vx);
      
      if (Math.abs(gestureState.dx) > swipeThreshold || velocity > 0.5) {
        // Complete the swipe animation
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? 300 : -300,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Close player on both left and right swipes
          setCurrentSong(null);
          setIsPlaying(false);
          setCurrentTime(0);
          
          // Reset animations
          translateX.setValue(0);
          opacity.setValue(1);
        });
      } else {
        // Snap back to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  // Fetch songs from API
  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSongs();
      
      if (response.success && response.data) {
        // Transform API data to match our local interface
        const transformedSongs: Song[] = response.data.map((apiSong: ApiSong) => {
          // Generate emoji thumbnail based on song content
          let thumbnail = '🎵'; // default
          const title = apiSong.title.toLowerCase();
          const genre = apiSong.genre?.toLowerCase() || '';
          
          if (title.includes('devotional') || title.includes('bhajan') || genre.includes('devotional')) {
            thumbnail = '🕉️';
          } else if (title.includes('classical') || genre.includes('classical')) {
            thumbnail = '🎼';
          } else if (title.includes('folk') || genre.includes('folk')) {
            thumbnail = '🪕';
          } else if (title.includes('modern') || genre.includes('modern')) {
            thumbnail = '🎧';
          }
          
          return {
            id: apiSong._id,
            _id: apiSong._id,
            title: apiSong.title,
            artist: apiSong.artist,
            duration: apiSong.duration,
            thumbnail: thumbnail,
            thumbnailUrl: apiSong.thumbnailUrl,
            category: apiSong.genre || 'Music',
            audioUrl: apiSong.audioUrl,
            album: apiSong.album,
            genre: apiSong.genre,
            releaseDate: apiSong.releaseDate,
            lyrics: apiSong.lyrics,
            isActive: apiSong.isActive,
            createdAt: apiSong.createdAt,
            updatedAt: apiSong.updatedAt,
          };
        });
        
        setSongs(transformedSongs);
      } else {
        setError('Failed to load songs from server');
        setSongs([]); // Empty array instead of mock data
      }
    } catch (err: any) {
      console.error('Error fetching songs:', err);
      setError(err.message || 'Failed to load songs from server');
      setSongs([]); // Empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // expo-audio handles audio mode configuration automatically
    fetchSongs();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (status.playing) {
        player.pause();
      }
    };
  }, []);

  // Handle song change - stop previous playback
  useEffect(() => {
    if (status.playing) {
      player.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentSong?.id]);

  // Monitor player status
  useEffect(() => {
    if (status.playing) {
      setIsPlaying(true);
      setCurrentTime(Math.floor(status.currentTime));
    } else {
      setIsPlaying(false);
    }
    
    if (status.duration && !currentSong?.duration) {
      // Update song duration if not set
      if (currentSong) {
        setCurrentSong({ ...currentSong, duration: Math.floor(status.duration) });
      }
    }
  }, [status.playing, status.currentTime, status.duration]);



  // Function to play a specific song
  const playSong = async (song: Song) => {
    try {
      // Stop current audio if playing
      if (status.playing) {
        player.pause();
      }
      
      // Reset states
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTime(0);
      
      // Set the new song
      setCurrentSong(song);
      
      // Start loading and playing
      if (song.audioUrl) {
        setIsLoading(true);
        
        player.replace(song.audioUrl);
        player.volume = volume;
        
        // Wait a tick for the source to load
        setTimeout(() => {
          player.play();
          setIsPlaying(true);
          setIsLoading(false);
        }, 100);
        
        console.log('🔊 New song loaded with volume:', volume);
      } else {
        console.log('⚠️ Song has no audio URL:', song.title);
        // alert('❌ No audio available for this song');
      }
    } catch (error: any) {
      console.error('🚨 Error playing song:', error);
      setIsLoading(false);
      setIsPlaying(false);
      
      // alert('❌ Could not play this song. Please try again.');
    }
  };

  const handleMenuOption = (option: string) => {
    setShowMenu(false);
    switch (option) {
      case 'favorite':
        alert('❤️ Added to Favorites!');
        break;
      case 'playlist':
        alert('📂 Add to Playlist feature coming soon!');
        break;
      case 'share':
        alert('📤 Share feature coming soon!');
        break;
      case 'download':
        alert('⬇️ Download feature coming soon!');
        break;
      case 'lyrics':
        alert('📝 Lyrics feature coming soon!');
        break;
    }
  };

  // Song List Item Component
  const renderSongItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => handleSongSelect(item)}
      activeOpacity={0.9}
    >
      <View style={[
        styles.songCard,
        currentSong?.id === item.id && { backgroundColor: '#f8f9ff' }
      ]}>
        {/* Left side thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.thumbnailUrl ? (
            <Image 
              source={{ uri: item.thumbnailUrl }} 
              style={styles.thumbnailImage}
              defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            />
          ) : (
            <Text style={styles.thumbnailIcon}>{item.thumbnail}</Text>
          )}
        </View>
        
        {/* Middle section - Song info */}
        <View style={styles.songInfo}>
          <View style={styles.songTitleRow}>
            <Text style={[
              styles.songTitle, 
              currentSong?.id === item.id && isPlaying && { color: '#667eea' }
            ]} numberOfLines={1}>
              {item.title}
            </Text>
            {currentSong?.id === item.id && isPlaying && (
              <View style={styles.playingIndicator}>
                {animValues.slice(0, 3).map((animValue, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveBar,
                      {
                        height: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [4, 16],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
          <Text style={styles.songDescription} numberOfLines={1}>{item.description}</Text>
        </View>
        
        {/* Right side - Play button */}
        <TouchableOpacity 
          style={styles.playButtonContainer}
          onPress={() => handlePlayButtonPress(item)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={currentSong?.id === item.id && isPlaying ? 'pause-circle' : 'play-circle'} 
            size={40} 
            color="#667eea" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            ...styles.header,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="musical-notes" size={48} color="white" />
          <Text style={[styles.headerTitleText, { marginTop: 16 }]}>
            Loading Songs...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity 
            onPress={fetchSongs}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>
              {language === 'tamil' ? 'பக्ति संगीत' : 'Devotional Music'}
            </Text>
            <Text style={styles.headerSubtitle}>Sacred Songs Collection</Text>
          </View>

          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Mini Player (when song is selected) */}
      {currentSong && (
        <Animated.View
          style={[
            styles.miniPlayer,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.miniPlayerContent}
            onPress={openFullPlayer}
          >
            <View style={styles.miniAlbumArt}>
              {currentSong.thumbnailUrl ? (
                <Image 
                  source={{ uri: currentSong.thumbnailUrl }} 
                  style={styles.miniAlbumImage}
                />
              ) : (
                <Text style={styles.miniAlbumIcon}>{currentSong.thumbnail}</Text>
              )}
            </View>
            
            <View style={styles.miniSongInfo}>
              <Text style={styles.miniSongTitle} numberOfLines={1}>
                {currentSong.title}
              </Text>
              <Text style={styles.miniSongArtist} numberOfLines={1}>
                {currentSong.artist}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.miniPlayButton}
              onPress={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
            >
              <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
                {isLoading ? (
                  <Ionicons 
                    name="hourglass" 
                    size={24} 
                    color="#667eea" 
                  />
                ) : (
                  <Ionicons 
                    name={isPlaying ? 'pause' : 'play'} 
                    size={24} 
                    color="#667eea" 
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
          
          {/* Mini Progress Bar */}
          <View style={styles.miniProgressBar}>
            <View style={[styles.miniProgress, { width: `${(currentTime / currentSong.duration) * 100}%` }]} />
          </View>
          
          {/* Swipe hint indicators */}
          <View style={styles.swipeHints}>
            <Ionicons name="chevron-back" size={12} color="rgba(255,255,255,0.3)" />
            <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.3)" />
          </View>
        </Animated.View>
      )}

      {/* Songs List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎵 {language === 'tamil' ? 'பక्ति गाने' : 'Devotional Songs'}
          </Text>
          
          {songs.length > 0 ? (
            <FlatList
              data={songs}
              renderItem={renderSongItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Songs Available</Text>
              <Text style={styles.emptyStateText}>
                {error ? 'Failed to load songs from server' : 'Loading songs...'}
              </Text>
              {error && (
                <TouchableOpacity 
                  onPress={fetchSongs}
                  style={styles.retryButtonLarge}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full Screen Player Modal */}
      <Modal
        visible={showFullPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.fullPlayerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.fullPlayerGradient}
          >
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />
            
            {/* Full Player Header */}
            <View style={styles.fullPlayerHeader}>
              <TouchableOpacity 
                onPress={() => setShowFullPlayer(false)}
                style={styles.fullPlayerBackButton}
              >
                <Ionicons name="chevron-down" size={28} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.fullPlayerHeaderText}>Now Playing</Text>
              
              <TouchableOpacity 
                style={styles.fullPlayerMenuButton}
                onPress={() => setShowMenu(true)}
              >
                <Ionicons name="ellipsis-vertical" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {currentSong && (
              <>
                {/* Large Album Art */}
                <View style={styles.fullPlayerContent}>
                  <View style={styles.largeAlbumArt}>
                    {currentSong.thumbnailUrl ? (
                      <Animated.View
                        style={{
                          transform: [{
                            rotate: thumbnailRotation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            })
                          }]
                        }}
                      >
                        <Image 
                          source={{ uri: currentSong.thumbnailUrl }} 
                          style={styles.largeAlbumImage}
                        />
                      </Animated.View>
                    ) : (
                      <Text style={styles.largeAlbumIcon}>{currentSong.thumbnail}</Text>
                    )}
                  </View>
                  
                  {/* Song Info */}
                  <View style={styles.fullSongInfo}>
                    <Text style={styles.fullSongTitle}>{currentSong.title}</Text>
                    <Text style={styles.fullSongArtist}>{currentSong.artist}</Text>
                    <Text style={styles.fullSongDescription}>{currentSong.description}</Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.fullProgressContainer}>
                    <View style={styles.fullProgressBar}>
                      <View style={[styles.fullProgress, { width: `${(currentTime / currentSong.duration) * 100}%` }]} />
                    </View>
                    <View style={styles.fullTimeContainer}>
                      <Text style={styles.fullTimeText}>{formatTime(currentTime)}</Text>
                      <Text style={styles.fullTimeText}>{formatTime(currentSong.duration)}</Text>
                    </View>
                  </View>

                  {/* Full Player Controls */}
                  <View style={styles.fullPlayerControls}>
                    <TouchableOpacity 
                      style={styles.fullControlButton}
                      onPress={handlePreviousSong}
                    >
                      <Ionicons name="play-skip-back" size={32} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.fullPlayPauseButton}
                      onPress={handlePlayPause}
                    >
                      <View style={styles.fullPlayPauseContainer}>
                        {isLoading ? (
                          <Ionicons 
                            name="hourglass" 
                            size={36} 
                            color="#667eea" 
                          />
                        ) : (
                          <Ionicons 
                            name={isPlaying ? 'pause' : 'play'} 
                            size={36} 
                            color="#667eea" 
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.fullControlButton}
                      onPress={handleNextSong}
                    >
                      <Ionicons name="play-skip-forward" size={32} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Volume Control */}
                  <View style={styles.volumeContainer}>
                    <TouchableOpacity 
                      onPress={() => handleVolumeChange('down')}
                      style={styles.volumeButton}
                    >
                      <Ionicons name="volume-low" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                    <View style={styles.volumeSlider}>
                      <View style={[styles.volumeProgress, { width: `${volume * 100}%` }]} />
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleVolumeChange('up')}
                      style={styles.volumeButton}
                    >
                      <Ionicons name="volume-high" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
            
          </LinearGradient>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('favorite')}
            >
              <Ionicons name="heart-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Add to Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('playlist')}
            >
              <Ionicons name="list-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Add to Playlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('share')}
            >
              <Ionicons name="share-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Share Song</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('download')}
            >
              <Ionicons name="download-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('lyrics')}
            >
              <Ionicons name="document-text-outline" size={24} color="#333" />
              <Text style={styles.menuText}>Show Lyrics</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <BottomNavigation navigation={navigation} activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Mini Player Styles
  miniPlayer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  miniAlbumArt: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  miniAlbumIcon: {
    fontSize: 24,
  },
  miniAlbumImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Perfect circle
    resizeMode: 'cover', // Fit image properly
  },
  miniSongInfo: {
    flex: 1,
    marginRight: 15,
  },
  miniSongTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  miniSongArtist: {
    fontSize: 14,
    color: '#666',
  },
  miniPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniProgressBar: {
    height: 3,
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  miniProgress: {
    height: 3,
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 15,
  },
  swipeIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'none',
  },
  swipeIndicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  swipeIndicatorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  swipeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginHorizontal: 4,
  },
  swipeHints: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  // Song List Styles
  songItem: {
    marginBottom: 15,
  },
  songCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  thumbnailIcon: {
    fontSize: 28,
  },
  thumbnailImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Perfect circle
    resizeMode: 'cover', // Fit image properly
  },
  songInfo: {
    flex: 1,
    marginRight: 15,
  },
  songTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#667eea',
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  wave1: {
    height: 12,
  },
  wave2: {
    height: 8,
  },
  wave3: {
    height: 15,
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  songDescription: {
    fontSize: 12,
    color: '#999',
  },
  playButtonContainer: {
    padding: 5,
  },

  // Full Screen Player Styles
  fullPlayerContainer: {
    flex: 1,
  },
  fullPlayerGradient: {
    flex: 1,
  },
  fullPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fullPlayerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPlayerHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  fullPlayerMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPlayerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  largeAlbumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  largeAlbumIcon: {
    fontSize: 120,
  },
  largeAlbumImage: {
    width: 200,
    height: 200,
    borderRadius: 100, // Perfect circle
    resizeMode: 'cover', // Fit image properly
  },
  fullSongInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  fullSongTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  fullSongArtist: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  fullSongDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  fullProgressContainer: {
    width: '100%',
    marginBottom: 50,
  },
  fullProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  fullProgress: {
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  fullTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullTimeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fullPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  fullControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  fullPlayPauseButton: {
    marginHorizontal: 30,
  },
  fullPlayPauseContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 15,
  },
  volumeProgress: {
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  volumeButton: {
    padding: 10,
    borderRadius: 20,
  },

  // Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },

  // Error and Loading Styles
  errorContainer: {
    backgroundColor: 'rgba(255, 87, 87, 0.1)',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff5757',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#ff5757',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButtonLarge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});