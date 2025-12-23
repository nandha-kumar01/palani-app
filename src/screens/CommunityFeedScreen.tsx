import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useApp } from '../context/AppContext';
import CameraService from '../services/cameraService';
import { showToast } from '../utils/toast';

interface Post {
  id: string;
  userId: string;
  userNames: string;
  userAvatar?: string;
  content: string;
  images: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  tags: string[];
  location?: {
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
  activityType?: 'walk' | 'temple_visit' | 'group_walk' | 'achievement' | 'general';
  activityId?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface CommunityFeedScreenProps {
  navigation: any;
}

export default function CommunityFeedScreen({ navigation }: CommunityFeedScreenProps) {
  const { language, user } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [commenting, setCommenting] = useState<{ postId: string; visible: boolean }>({ postId: '', visible: false });
  const [newComment, setNewComment] = useState('');

  const filters = [
    { id: 'all', title: language === 'tamil' ? 'அனைத்தும்' : 'All', icon: '🌟' },
    { id: 'walks', title: language === 'tamil' ? 'நடைகள்' : 'Walks', icon: '🚶‍♂️' },
    { id: 'temples', title: language === 'tamil' ? 'கோவில்கள்' : 'Temples', icon: '🏛️' },
    { id: 'achievements', title: language === 'tamil' ? 'சாதனைகள்' : 'Achievements', icon: '🏆' },
    { id: 'groups', title: language === 'tamil' ? 'குழுக்கள்' : 'Groups', icon: '👥' },
  ];

  useEffect(() => {
    loadCommunityPosts();
  }, [selectedFilter]);

  const loadCommunityPosts = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API integration
      const mockPosts: Post[] = [
        {
          id: '1',
          userId: 'user123',
          userNames: 'Rajesh Kumar',
          userAvatar: undefined,
          content: 'Completed my morning pilgrimage walk to the hilltop temple. Feeling blessed and energized! 🙏 #MorningWalk #Blessed',
          images: [],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 15,
          comments: [
            {
              id: 'c1',
              userId: 'user456',
              userName: 'Priya S',
              content: 'So inspiring! I want to join you next time.',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              likes: 3,
              isLiked: false,
            }
          ],
          isLiked: false,
          tags: ['morning', 'walk', 'temple'],
          location: { name: 'Palani Hills', coordinates: { latitude: 10.4516, longitude: 77.5206 } },
          activityType: 'walk',
          activityId: 'walk123',
        },
        {
          id: '2',
          userId: 'user789',
          userNames: 'Meera Devi',
          content: '🏆 Achievement Unlocked: "Devoted Walker" - Completed 50 pilgrimage walks! The journey continues...',
          images: [],
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 32,
          comments: [],
          isLiked: true,
          tags: ['achievement', 'milestone'],
          activityType: 'achievement',
          activityId: 'achievement_devoted_walker',
        },
        {
          id: '3',
          userId: 'user456',
          userNames: 'Suresh Babu',
          content: 'Beautiful sunrise from the temple today. Nature\'s way of blessing our spiritual journey! 📸',
          images: ['https://example.com/sunrise.jpg'],
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: 28,
          comments: [
            {
              id: 'c2',
              userId: 'user123',
              userName: 'Rajesh Kumar',
              content: 'Breathtaking view! Thanks for sharing.',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              likes: 1,
              isLiked: false,
            }
          ],
          isLiked: false,
          tags: ['temple', 'sunrise', 'photography'],
          activityType: 'temple_visit',
          activityId: 'temple_main',
        },
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load community posts:', error);
      showToast.error(language === 'tamil' ? 'இடுகைகளை ஏற்ற முடியவில்லை' : 'Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCommunityPosts();
  };

  const handleLike = async (postId: string) => {
    try {
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            };
          }
          return post;
        })
      );
      
      // Here you would send API request to like/unlike the post
      console.log('👍 Post liked:', postId);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = (postId: string) => {
    setCommenting({ postId, visible: true });
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: user?.id || 'current_user',
        userName: user?.name || 'Current User',
        userAvatar: user?.profilePicture,
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === commenting.postId) {
            return { ...post, comments: [...post.comments, comment] };
          }
          return post;
        })
      );

      setNewComment('');
      setCommenting({ postId: '', visible: false });
      
      showToast.success(language === 'tamil' ? 'கருத்து சேர்க்கப்பட்டது' : 'Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      showToast.error(language === 'tamil' ? 'கருத்தைச் சேர்க்க முடியவில்லை' : 'Failed to add comment');
    }
  };

  const handleShare = (post: Post) => {
    Alert.alert(
      language === 'tamil' ? 'பகிர்' : 'Share',
      language === 'tamil' ? 'இந்த இடுகையை எங்கே பகிர வேண்டும்?' : 'Where would you like to share this post?',
      [
        { text: language === 'tamil' ? 'ரத்து' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'tamil' ? 'வாட்ஸ்ஆப்' : 'WhatsApp', 
          onPress: () => shareToWhatsApp(post) 
        },
        { 
          text: language === 'tamil' ? 'நகலெடு' : 'Copy Link', 
          onPress: () => copyLink(post) 
        },
      ]
    );
  };

  const shareToWhatsApp = (post: Post) => {
    const message = `Check out this post from ${post.userNames}: "${post.content}" - Palani Pathayathirai App`;
    // Here you would integrate with WhatsApp sharing
    showToast.success(language === 'tamil' ? 'வாட்ஸ்ஆப்பில் பகிரப்பட்டது' : 'Shared to WhatsApp');
  };

  const copyLink = (post: Post) => {
    // Here you would copy the post link to clipboard
    showToast.success(language === 'tamil' ? 'இணைப்பு நகலெடுக்கப்பட்டது' : 'Link copied to clipboard');
  };

  const openCreatePost = () => {
    setIsCreatePostVisible(true);
  };

  const addImage = async () => {
    try {
      const result = await CameraService.showImagePickerOptions();
      if (result) {
        setSelectedImages(prev => [...prev, result.uri]);
      }
    } catch (error) {
      console.error('Failed to add image:', error);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert(
        language === 'tamil' ? 'பிழை' : 'Error',
        language === 'tamil' ? 'தயவுசெய்து உள்ளடக்கத்தை எழுதுங்கள்' : 'Please write some content'
      );
      return;
    }

    try {
      const newPost: Post = {
        id: Date.now().toString(),
        userId: user?.id || 'current_user',
        userNames: user?.name || 'Current User',
        userAvatar: user?.profilePicture,
        content: newPostContent.trim(),
        images: selectedImages,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        isLiked: false,
        tags: extractTags(newPostContent),
        activityType: 'general',
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Reset form
      setNewPostContent('');
      setSelectedImages([]);
      setIsCreatePostVisible(false);
      
      showToast.success(language === 'tamil' ? 'இடுகை வெளியிடப்பட்டது' : 'Post published');
    } catch (error) {
      console.error('Failed to create post:', error);
      showToast.error(language === 'tamil' ? 'இடுகையை வெளியிட முடியவில்லை' : 'Failed to publish post');
    }
  };

  const extractTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  };

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
      return language === 'tamil' 
        ? `${diffInMinutes} நிமிடங்களுக்கு முன்`
        : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return language === 'tamil' 
        ? `${diffInHours} மணி நேரத்திற்கு முன்`
        : `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return language === 'tamil' 
        ? `${diffInDays} நாட்களுக்கு முன்`
        : `${diffInDays} days ago`;
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <WhiteCard style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.userAvatar ? (
              <Image source={{ uri: item.userAvatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.userNames.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userNames}</Text>
            <Text style={styles.postTime}>{formatTimestamp(item.timestamp)}</Text>
            {item.location && (
              <Text style={styles.location}>📍 {item.location.name}</Text>
            )}
          </View>
        </View>
        {item.activityType && (
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>
              {item.activityType === 'walk' && '🚶‍♂️'}
              {item.activityType === 'temple_visit' && '🏛️'}
              {item.activityType === 'achievement' && '🏆'}
              {item.activityType === 'group_walk' && '👥'}
            </Text>
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Post Images */}
      {item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.postImage} />
          ))}
        </ScrollView>
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={[styles.actionButton, item.isLiked && styles.likedButton]}
          onPress={() => handleLike(item.id)}
        >
          <Text style={[styles.actionIcon, item.isLiked && styles.likedIcon]}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes} {language === 'tamil' ? 'விருப்பங்கள்' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>
            {item.comments.length} {language === 'tamil' ? 'கருத்துகள்' : 'Comments'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>
            {language === 'tamil' ? 'பகிர்' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments Preview */}
      {item.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          {item.comments.slice(0, 2).map(comment => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentUser}>{comment.userName}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
          {item.comments.length > 2 && (
            <TouchableOpacity onPress={() => handleComment(item.id)}>
              <Text style={styles.viewAllComments}>
                {language === 'tamil' 
                  ? `மேலும் ${item.comments.length - 2} கருத்துகளைப் பார்க்கவும்`
                  : `View ${item.comments.length - 2} more comments`
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </WhiteCard>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary.start, colors.primary.end]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {language === 'tamil' ? 'சமூக ஊடகம்' : 'Community Feed'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'tamil' ? 'பக்தர்களுடன் இணைக்கவும்' : 'Connect with fellow devotees'}
          </Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={openCreatePost}>
          <Text style={styles.createButtonIcon}>✏️</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        style={styles.postsList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.postsContainer}
      />

      {/* Create Post Modal */}
      <Modal
        visible={isCreatePostVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCreatePostVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsCreatePostVisible(false)}>
              <Text style={styles.modalCancel}>
                {language === 'tamil' ? 'ரத்து' : 'Cancel'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'tamil' ? 'புதிய இடுகை' : 'New Post'}
            </Text>
            <TouchableOpacity onPress={createPost}>
              <Text style={styles.modalPost}>
                {language === 'tamil' ? 'பதிவு' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.userInfoModal}>
              <View style={styles.avatar}>
                {user?.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{user?.name?.charAt(0) || '👤'}</Text>
                )}
              </View>
              <Text style={styles.userNameModal}>{user?.name || 'User'}</Text>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder={language === 'tamil' 
                ? 'உங்கள் ஆன்மீக அனுபவத்தைப் பகிருங்கள்...'
                : 'Share your spiritual experience...'
              }
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              textAlignVertical="top"
            />

            {selectedImages.length > 0 && (
              <ScrollView horizontal style={styles.selectedImagesContainer}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.selectedImageWrapper}>
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.addImageButton} onPress={addImage}>
              <Text style={styles.addImageIcon}>📷</Text>
              <Text style={styles.addImageText}>
                {language === 'tamil' ? 'புகைப்படம் சேர்' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={commenting.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommenting({ postId: '', visible: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCommenting({ postId: '', visible: false })}>
              <Text style={styles.modalCancel}>
                {language === 'tamil' ? 'ரத்து' : 'Cancel'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'tamil' ? 'கருத்துகள்' : 'Comments'}
            </Text>
            <TouchableOpacity onPress={submitComment}>
              <Text style={styles.modalPost}>
                {language === 'tamil' ? 'பதிவு' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder={language === 'tamil' ? 'கருத்தை எழுதுங்கள்...' : 'Write a comment...'}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
          </View>
        </View>
      </Modal>

      <BottomNavigation navigation={navigation} activeTab="community" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonIcon: {
    fontSize: 18,
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.gray.light,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.start,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  filterText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  filterTextActive: {
    color: colors.white,
  },
  postsList: {
    flex: 1,
  },
  postsContainer: {
    padding: spacing.lg,
  },
  postCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.start,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
  },
  postTime: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    marginTop: spacing.xs,
  },
  location: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    marginTop: spacing.xs,
  },
  activityBadge: {
    backgroundColor: colors.primary.start,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
  },
  activityText: {
    fontSize: 16,
  },
  postContent: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  imagesContainer: {
    marginBottom: spacing.md,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.gray.light,
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  likedButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  likedIcon: {
    color: colors.danger,
  },
  actionText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    fontWeight: fonts.weights.medium,
  },
  likedText: {
    color: colors.danger,
  },
  commentsPreview: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray.light,
  },
  comment: {
    marginBottom: spacing.sm,
  },
  commentUser: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
  },
  commentContent: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    marginTop: spacing.xs,
  },
  viewAllComments: {
    fontSize: fonts.sizes.sm,
    color: colors.primary.start,
    fontWeight: fonts.weights.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  modalCancel: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
  },
  modalPost: {
    fontSize: fonts.sizes.md,
    color: colors.primary.start,
    fontWeight: fonts.weights.semibold,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  userInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userNameModal: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
  },
  postInput: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  selectedImagesContainer: {
    marginBottom: spacing.lg,
  },
  selectedImageWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fonts.weights.bold,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray.light,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
  },
  addImageIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  addImageText: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    fontWeight: fonts.weights.medium,
  },
  commentInputContainer: {
    padding: spacing.lg,
  },
  commentInput: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    borderWidth: 1,
    borderColor: colors.gray.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});