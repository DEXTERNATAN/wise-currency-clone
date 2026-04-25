import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAlertsStore, AlertDirection, RateAlert } from '@/store/alertsStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { getCurrency } from '@/utils/currencies';
import { formatRate, convert } from '@/utils/format';

export default function AlertsScreen() {
  const { alerts, loadAlerts, addAlert, toggleAlert, deleteAlert } = useAlertsStore();
  const { fromCurrency, toCurrency, rates } = useCurrencyStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [targetStr, setTargetStr] = useState('');
  const [direction, setDirection] = useState<AlertDirection>('below');

  useEffect(() => {
    loadAlerts();
  }, []);

  const currentRate = Object.keys(rates).length
    ? convert(1, fromCurrency, toCurrency, rates)
    : 0;

  const handleAdd = async () => {
    const target = parseFloat(targetStr.replace(',', '.'));
    if (!target || isNaN(target)) {
      Alert.alert('Valor inválido', 'Digite uma taxa alvo válida.');
      return;
    }
    await addAlert({
      fromCurrency,
      toCurrency,
      direction,
      targetRate: target,
      active: true,
    });
    setTargetStr('');
    setModalVisible(false);
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Remover alerta', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteAlert(id) },
    ]);
  };

  const renderAlert = ({ item }: { item: RateAlert }) => {
    const fromCur = getCurrency(item.fromCurrency);
    const toCur = getCurrency(item.toCurrency);
    const triggered = !!item.triggeredAt;

    return (
      <View style={[styles.alertCard, triggered && styles.alertCardTriggered]}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertPair}>
            {fromCur?.flag} {item.fromCurrency} → {toCur?.flag} {item.toCurrency}
          </Text>
          <Switch
            value={item.active && !triggered}
            onValueChange={() => { if (!triggered) toggleAlert(item.id); }}
            trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
            thumbColor={item.active ? '#37517e' : '#9ca3af'}
          />
        </View>
        <Text style={styles.alertCondition}>
          {item.direction === 'below' ? '📉 Quando cair abaixo de' : '📈 Quando subir acima de'}{' '}
          <Text style={styles.alertTarget}>{formatRate(item.targetRate)}</Text>
        </Text>
        {triggered && (
          <Text style={styles.triggeredLabel}>
            ✅ Disparado em {new Date(item.triggeredAt!).toLocaleDateString('pt-BR')}
          </Text>
        )}
        <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Remover</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alertas de Câmbio</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {currentRate > 0 && (
          <View style={styles.currentRateBadge}>
            <Text style={styles.currentRateText}>
              Taxa atual: 1 {fromCurrency} = {formatRate(currentRate)} {toCurrency}
            </Text>
          </View>
        )}

        {alerts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Nenhum alerta configurado</Text>
            <Text style={styles.emptyText}>
              Crie alertas para ser notificado quando a taxa atingir seu valor alvo.
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={renderAlert}
            contentContainerStyle={{ gap: 12 }}
          />
        )}
      </View>

      {/* Modal de criação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Novo Alerta</Text>
            <Text style={styles.modalSubtitle}>
              Par: {fromCurrency} → {toCurrency}
            </Text>

            <View style={styles.directionRow}>
              {(['below', 'above'] as AlertDirection[]).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dirBtn, direction === d && styles.dirBtnActive]}
                  onPress={() => setDirection(d)}
                >
                  <Text style={[styles.dirBtnText, direction === d && styles.dirBtnTextActive]}>
                    {d === 'below' ? '📉 Cair abaixo' : '📈 Subir acima'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Taxa alvo</Text>
            <TextInput
              style={styles.targetInput}
              value={targetStr}
              onChangeText={setTargetStr}
              keyboardType="decimal-pad"
              placeholder={currentRate ? formatRate(currentRate) : '0.0000'}
              placeholderTextColor="#d1d5db"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Salvar Alerta</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { flex: 1, padding: 20, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  addBtn: {
    backgroundColor: '#37517e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  currentRateBadge: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  currentRateText: { fontSize: 13, color: '#37517e', fontWeight: '600' },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  alertCardTriggered: { borderWidth: 1.5, borderColor: '#22c55e' },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertPair: { fontSize: 15, fontWeight: '700', color: '#1e3a5f' },
  alertCondition: { fontSize: 13, color: '#6b7280' },
  alertTarget: { fontWeight: '700', color: '#37517e' },
  triggeredLabel: { fontSize: 12, color: '#059669', fontWeight: '600' },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteBtnText: { fontSize: 12, color: '#ef4444' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
  // Modal
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalContainer: { padding: 24, gap: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e3a5f' },
  modalSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: -8 },
  directionRow: { flexDirection: 'row', gap: 10 },
  dirBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dirBtnActive: { borderColor: '#37517e', backgroundColor: '#f0f4ff' },
  dirBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  dirBtnTextActive: { color: '#37517e' },
  fieldLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  targetInput: {
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    borderRadius: 10,
    padding: 14,
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a5f',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, color: '#6b7280', fontWeight: '600' },
  saveBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#37517e',
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
