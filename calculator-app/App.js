import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Vibration,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';

const BUTTON_LAYOUT = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const OP_MAP = { '÷': '/', '×': '*', '−': '-', '+': '+' };
const OPS = new Set(['÷', '×', '−', '+']);

function formatDisplay(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  // 大きい/小さい数は指数表記
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(4);
  }
  // 小数点以下の桁数を抑える
  const str = value.toString();
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts[1] && parts[1].length > 8) {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }
  }
  return str;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);

  const vibrate = () => Vibration.vibrate(30);

  const calculate = useCallback((a, b, op) => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    switch (op) {
      case '÷': return y === 0 ? 'Error' : String(x / y);
      case '×': return String(x * y);
      case '−': return String(x - y);
      case '+': return String(x + y);
      default: return b;
    }
  }, []);

  const handlePress = useCallback((btn) => {
    vibrate();

    if (btn === 'AC') {
      setDisplay('0');
      setExpression('');
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    if (btn === '+/-') {
      if (display !== '0' && display !== 'Error') {
        setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
      }
      return;
    }

    if (btn === '%') {
      const val = parseFloat(display);
      if (!isNaN(val)) {
        setDisplay(String(val / 100));
      }
      return;
    }

    if (OPS.has(btn)) {
      if (operator && !waitingForOperand) {
        const result = calculate(prevValue, display, operator);
        if (result === 'Error') {
          setDisplay('Error');
          setPrevValue(null);
          setOperator(null);
          setExpression('');
          return;
        }
        setDisplay(result);
        setPrevValue(result);
        setExpression(`${formatDisplay(result)} ${btn}`);
      } else {
        setPrevValue(display);
        setExpression(`${formatDisplay(display)} ${btn}`);
      }
      setOperator(btn);
      setWaitingForOperand(true);
      return;
    }

    if (btn === '=') {
      if (!operator || prevValue === null) return;
      const result = calculate(prevValue, display, operator);
      const expr = `${formatDisplay(prevValue)} ${operator} ${formatDisplay(display)} =`;
      if (result !== 'Error') {
        setHistory((h) => [{ expr, result: formatDisplay(result) }, ...h].slice(0, 10));
      }
      setDisplay(result === 'Error' ? 'Error' : formatDisplay(result));
      setExpression(expr);
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      return;
    }

    if (btn === '.') {
      if (waitingForOperand) {
        setDisplay('0.');
        setWaitingForOperand(false);
        return;
      }
      if (!display.includes('.')) {
        setDisplay(display + '.');
      }
      return;
    }

    // 数字
    if (waitingForOperand) {
      setDisplay(btn);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' || display === 'Error' ? btn : display + btn);
    }
  }, [display, operator, prevValue, waitingForOperand, calculate]);

  const getButtonStyle = (btn) => {
    if (OPS.has(btn) || btn === '=') return styles.btnOperator;
    if (btn === 'AC' || btn === '+/-' || btn === '%') return styles.btnFunction;
    return styles.btnNumber;
  };

  const getTextStyle = (btn) => {
    if (OPS.has(btn) || btn === '=') return styles.textOperator;
    if (btn === 'AC' || btn === '+/-' || btn === '%') return styles.textFunction;
    return styles.textNumber;
  };

  const fontSize = display.length > 9 ? 36 : display.length > 6 ? 48 : 64;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />

      {/* 計算履歴 */}
      {history.length > 0 && (
        <ScrollView style={styles.history} contentContainerStyle={styles.historyContent}>
          {history.map((h, i) => (
            <View key={i} style={styles.historyItem}>
              <Text style={styles.historyExpr}>{h.expr}</Text>
              <Text style={styles.historyResult}>{h.result}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ディスプレイ */}
      <View style={styles.display}>
        <Text style={styles.expressionText} numberOfLines={1}>{expression}</Text>
        <Text style={[styles.displayText, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatDisplay(display)}
        </Text>
      </View>

      {/* ボタン */}
      <View style={styles.buttons}>
        {BUTTON_LAYOUT.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                  styles.btn,
                  getButtonStyle(btn),
                  btn === '0' && styles.btnWide,
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnText, getTextStyle(btn)]}>{btn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const BTN_SIZE = 80;
const GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'flex-end',
  },
  history: {
    maxHeight: 120,
    paddingHorizontal: 16,
  },
  historyContent: {
    paddingVertical: 8,
  },
  historyItem: {
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  historyExpr: {
    color: '#666',
    fontSize: 12,
  },
  historyResult: {
    color: '#999',
    fontSize: 16,
  },
  display: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  expressionText: {
    color: '#666',
    fontSize: 18,
    marginBottom: 4,
  },
  displayText: {
    color: '#fff',
    fontWeight: '200',
  },
  buttons: {
    paddingHorizontal: GAP,
    paddingBottom: Platform.OS === 'android' ? 16 : 32,
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
    justifyContent: 'center',
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWide: {
    width: BTN_SIZE * 2 + GAP,
    paddingLeft: BTN_SIZE * 0.45,
    alignItems: 'flex-start',
  },
  btnNumber: { backgroundColor: '#333' },
  btnFunction: { backgroundColor: '#A5A5A5' },
  btnOperator: { backgroundColor: '#FF9500' },
  btnText: {
    fontSize: 28,
    fontWeight: '400',
  },
  textNumber: { color: '#fff' },
  textFunction: { color: '#1C1C1E' },
  textOperator: { color: '#fff' },
});
