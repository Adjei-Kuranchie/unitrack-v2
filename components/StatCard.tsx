import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

const StatCard = ({
  title,
  count,
  icon,
  color,
  onPress,
}: {
  title: string;
  count: number;
  icon: string;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    className="flex-1 rounded-lg bg-white p-4 shadow-sm"
    style={{ borderLeftWidth: 4, borderLeftColor: color }}
    onPress={onPress}
    disabled={!onPress}>
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-2xl font-bold text-gray-900">{count}</Text>
        <Text className="text-sm text-gray-600">{title}</Text>
      </View>
      <MaterialIcons name={icon as any} size={32} color={color} />
    </View>
  </TouchableOpacity>
);
export default StatCard;
