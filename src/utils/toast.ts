import Toast from 'react-native-root-toast';

export const showToast = {
  success: (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      backgroundColor: '#4CAF50',
      textColor: '#FFFFFF',
      opacity: 1,
      shadowColor: '#000000',
      textStyle: {
        fontSize: 14,
        fontWeight: '500',
      },
      containerStyle: {
        marginTop: 50,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
      },
    });
  },

  error: (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      backgroundColor: '#F44336',
      textColor: '#FFFFFF',
      opacity: 1,
      shadowColor: '#000000',
      textStyle: {
        fontSize: 14,
        fontWeight: '500',
      },
      containerStyle: {
        marginTop: 50,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
      },
    });
  },

  info: (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      backgroundColor: '#2196F3',
      textColor: '#FFFFFF',
      opacity: 1,
      shadowColor: '#000000',
      textStyle: {
        fontSize: 14,
        fontWeight: '500',
      },
      containerStyle: {
        marginTop: 50,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
      },
    });
  },

  warning: (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      backgroundColor: '#FF9800',
      textColor: '#FFFFFF',
      opacity: 1,
      shadowColor: '#000000',
      textStyle: {
        fontSize: 14,
        fontWeight: '500',
      },
      containerStyle: {
        marginTop: 50,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
      },
    });
  },
};
