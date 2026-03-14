import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';

// Open-Meteo API (無料・APIキー不要)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_API = 'https://geocoding-api.open-meteo.com/v1/search';

const WMO_CODES = {
  0: { label: '快晴', icon: '☀️' },
  1: { label: '晴れ', icon: '🌤️' },
  2: { label: '一部曇り', icon: '⛅' },
  3: { label: '曇り', icon: '☁️' },
  45: { label: '霧', icon: '🌫️' },
  48: { label: '濃霧', icon: '🌫️' },
  51: { label: '霧雨（弱）', icon: '🌦️' },
  53: { label: '霧雨', icon: '🌦️' },
  55: { label: '霧雨（強）', icon: '🌧️' },
  61: { label: '小雨', icon: '🌧️' },
  63: { label: '雨', icon: '🌧️' },
  65: { label: '大雨', icon: '🌧️' },
  71: { label: '小雪', icon: '🌨️' },
  73: { label: '雪', icon: '❄️' },
  75: { label: '大雪', icon: '❄️' },
  80: { label: 'にわか雨（弱）', icon: '🌦️' },
  81: { label: 'にわか雨', icon: '🌧️' },
  82: { label: 'にわか雨（強）', icon: '⛈️' },
  95: { label: '雷雨', icon: '⛈️' },
  96: { label: '雷雨＋ひょう', icon: '⛈️' },
  99: { label: '雷雨＋大ひょう', icon: '⛈️' },
};

const PRESET_CITIES = [
  { name: '東京', lat: 35.6762, lon: 139.6503 },
  { name: '大阪', lat: 34.6937, lon: 135.5023 },
  { name: '札幌', lat: 43.0618, lon: 141.3545 },
  { name: '福岡', lat: 33.5904, lon: 130.4017 },
  { name: '那覇', lat: 26.2124, lon: 127.6809 },
];

function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: '不明', icon: '🌡️' };
}

function getBgGradient(code) {
  if (code === 0 || code === 1) return ['#FFD700', '#FFA500'];
  if (code <= 3) return ['#87CEEB', '#4682B4'];
  if (code <= 48) return ['#B0BEC5', '#78909C'];
  if (code <= 67) return ['#546E7A', '#37474F'];
  if (code <= 77) return ['#B3E5FC', '#81D4FA'];
  return ['#37474F', '#263238'];
}

export default function App() {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = useCallback(async (lat, lon, name) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'wind_speed_10m',
          'weathercode',
          'precipitation',
        ].join(','),
        daily: [
          'weathercode',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
        ].join(','),
        timezone: 'Asia/Tokyo',
        forecast_days: 7,
      });

      const res = await fetch(`${WEATHER_API}?${params}`);
      if (!res.ok) throw new Error('天気データの取得に失敗しました');
      const data = await res.json();
      setWeather(data);
      setLocationName(name);
    } catch (e) {
      setError(e.message || '不明なエラー');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('位置情報のアクセスが拒否されました。都市を選択してください。');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      // Reverse geocoding
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = geo[0]?.city || geo[0]?.region || '現在地';
      setSelectedCity(null);
      fetchWeather(latitude, longitude, city);
    } catch (e) {
      setError('位置情報の取得に失敗しました。');
      setLoading(false);
    }
  }, [fetchWeather]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedCity) {
      fetchWeather(selectedCity.lat, selectedCity.lon, selectedCity.name);
    } else {
      getLocation();
    }
  }, [selectedCity, fetchWeather, getLocation]);

  useEffect(() => {
    // デフォルトで東京の天気を表示
    const tokyo = PRESET_CITIES[0];
    setSelectedCity(tokyo);
    fetchWeather(tokyo.lat, tokyo.lon, tokyo.name);
  }, []);

  const current = weather?.current;
  const daily = weather?.daily;
  const wInfo = current ? getWeatherInfo(current.weathercode) : null;
  const bgColors = current ? getBgGradient(current.weathercode) : ['#6C63FF', '#4A47A3'];

  const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <View style={[styles.container, { backgroundColor: bgColors[0] }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColors[0]} />

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* 都市選択 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityRow}>
          <TouchableOpacity style={[styles.cityBtn, !selectedCity && styles.cityBtnActive]} onPress={getLocation}>
            <Text style={styles.cityBtnText}>📍 現在地</Text>
          </TouchableOpacity>
          {PRESET_CITIES.map((city) => (
            <TouchableOpacity
              key={city.name}
              style={[styles.cityBtn, selectedCity?.name === city.name && styles.cityBtnActive]}
              onPress={() => {
                setSelectedCity(city);
                fetchWeather(city.lat, city.lon, city.name);
              }}
            >
              <Text style={styles.cityBtnText}>{city.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>読み込み中...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : current ? (
          <>
            {/* メイン天気 */}
            <View style={styles.mainCard}>
              <Text style={styles.cityName}>{locationName}</Text>
              <Text style={styles.weatherIcon}>{wInfo?.icon}</Text>
              <Text style={styles.temperature}>{Math.round(current.temperature_2m)}°C</Text>
              <Text style={styles.weatherLabel}>{wInfo?.label}</Text>
              <Text style={styles.feelsLike}>体感: {Math.round(current.apparent_temperature)}°C</Text>
            </View>

            {/* 詳細情報 */}
            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailValue}>{current.relative_humidity_2m}%</Text>
                <Text style={styles.detailLabel}>湿度</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={styles.detailValue}>{Math.round(current.wind_speed_10m)} km/h</Text>
                <Text style={styles.detailLabel}>風速</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌧️</Text>
                <Text style={styles.detailValue}>{current.precipitation} mm</Text>
                <Text style={styles.detailLabel}>降水量</Text>
              </View>
            </View>

            {/* 7日間予報 */}
            {daily && (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>7日間の予報</Text>
                {daily.time.map((date, i) => {
                  const d = new Date(date);
                  const dayName = i === 0 ? '今日' : i === 1 ? '明日' : `${DAYS_JP[d.getDay()]}曜日`;
                  const info = getWeatherInfo(daily.weathercode[i]);
                  return (
                    <View key={date} style={styles.forecastRow}>
                      <Text style={styles.forecastDay}>{dayName}</Text>
                      <Text style={styles.forecastIcon}>{info.icon}</Text>
                      <Text style={styles.forecastLabel}>{info.label}</Text>
                      <Text style={styles.forecastMin}>{Math.round(daily.temperature_2m_min[i])}°</Text>
                      <Text style={styles.forecastSep}>/</Text>
                      <Text style={styles.forecastMax}>{Math.round(daily.temperature_2m_max[i])}°</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 60 },
  cityRow: { paddingHorizontal: 12, marginBottom: 8 },
  cityBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cityBtnActive: { backgroundColor: 'rgba(255,255,255,0.5)' },
  cityBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  center: { alignItems: 'center', marginTop: 60 },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
  errorText: { color: '#FFD700', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  mainCard: { alignItems: 'center', paddingVertical: 20 },
  cityName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  weatherIcon: { fontSize: 80, marginVertical: 8 },
  temperature: { color: '#fff', fontSize: 64, fontWeight: '200' },
  weatherLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 20, marginTop: 4 },
  feelsLike: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  detailsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailIcon: { fontSize: 22 },
  detailValue: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 4 },
  detailLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  detailDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  forecastCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },
  forecastTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  forecastDay: { color: '#fff', width: 60, fontSize: 14 },
  forecastIcon: { fontSize: 20, width: 30 },
  forecastLabel: { flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  forecastMin: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  forecastSep: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 2 },
  forecastMax: { color: '#fff', fontSize: 15, fontWeight: 'bold', width: 36, textAlign: 'right' },
});
