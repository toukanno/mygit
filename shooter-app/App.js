import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// ── Game constants ────────────────────────────────────────────────────────────
const PW = 44, PH = 50;          // player size
const BW = 5,  BH = 16;          // player bullet size
const BULLET_SPEED   = 12;
const EBULLET_SPEED  = 3.5;
const LIVES          = 3;
const STAR_COUNT     = 55;

let _uid = 0;
const nid = () => String(++_uid);
const rnd = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const overlap = (ax, ay, aw, ah, bx, by, bw, bh) =>
  ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

// ── Enemy definitions ─────────────────────────────────────────────────────────
const EDEFS = [
  { w: 34, h: 34, maxHp: 1, pts: 100, sMin: 1.5, sMax: 3.0, emoji: '👾', fire: 0.004 },
  { w: 46, h: 46, maxHp: 3, pts: 300, sMin: 1.0, sMax: 2.0, emoji: '🛸', fire: 0.006 },
  { w: 58, h: 58, maxHp: 8, pts: 800, sMin: 0.5, sMax: 1.0, emoji: '💀', fire: 0.010 },
];

function newGame(prev) {
  return {
    px: W / 2 - PW / 2,
    py: H - 130,
    bullets: [],
    enemies: [],
    eBullets: [],
    exps: [],
    stars: Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: `s${i}`,
      x: rnd(0, W),
      y: rnd(0, H),
      r: rnd(0.8, 2.5),
      sp: rnd(0.5, 2.5),
      op: rnd(0.3, 1),
    })),
    score: 0,
    hi: prev?.hi ?? 0,
    lives: LIVES,
    level: 1,
    frame: 0,
    fireCd: 0,
    spawnCd: 0,
    inv: 0,   // invincibility frames after getting hit
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function App() {
  const [scene, setScene] = useState('title'); // 'title' | 'playing' | 'gameover'
  const [tick, setTick] = useState(0);

  const sceneRef = useRef('title');
  const g        = useRef(null);
  const raf      = useRef(null);
  const touch    = useRef({ on: false, x: 0, y: 0 });

  // PanResponder - created once, reads sceneRef for current scene
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => sceneRef.current === 'playing',
      onMoveShouldSetPanResponder:  () => sceneRef.current === 'playing',
      onPanResponderGrant: (e) => {
        touch.current = { on: true, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e) => {
        touch.current.x = e.nativeEvent.pageX;
        touch.current.y = e.nativeEvent.pageY;
      },
      onPanResponderRelease: () => { touch.current.on = false; },
    })
  ).current;

  // ── Game loop ───────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const gs = g.current;
    if (!gs || sceneRef.current !== 'playing') return;
    gs.frame++;

    // Player follows touch
    if (touch.current.on) {
      gs.px = clamp(touch.current.x - PW / 2, 0, W - PW);
      gs.py = clamp(touch.current.y - PH / 2, H * 0.3, H - PH - 10);
    }

    // Auto-fire (faster at higher levels)
    const fireRate = Math.max(7, 12 - gs.level);
    if (++gs.fireCd >= fireRate) {
      gs.fireCd = 0;
      const cx = gs.px + PW / 2 - BW / 2;
      gs.bullets.push({ id: nid(), x: cx, y: gs.py });
      if (gs.level >= 2) {
        gs.bullets.push({ id: nid(), x: cx - 13, y: gs.py + 5 });
        gs.bullets.push({ id: nid(), x: cx + 13, y: gs.py + 5 });
      }
      if (gs.level >= 4) {
        gs.bullets.push({ id: nid(), x: cx - 24, y: gs.py + 10 });
        gs.bullets.push({ id: nid(), x: cx + 24, y: gs.py + 10 });
      }
    }

    // Move player bullets
    gs.bullets = gs.bullets
      .map(b => ({ ...b, y: b.y - BULLET_SPEED }))
      .filter(b => b.y > -BH);

    // Spawn enemies
    const spawnRate = Math.max(28, 80 - gs.level * 5);
    if (++gs.spawnCd >= spawnRate) {
      gs.spawnCd = 0;
      const di = Math.min(Math.floor(rnd(0, Math.min(gs.level, 3))), 2);
      const d  = EDEFS[di];
      gs.enemies.push({
        id: nid(), ...d,
        x:  rnd(0, W - d.w),
        y:  -d.h,
        hp: d.maxHp,
        sp: rnd(d.sMin, d.sMax) * (1 + gs.level * 0.04),
        dx: di > 0 ? (Math.random() > 0.5 ? 1 : -1) * rnd(0.5, 1.5) : 0,
      });
    }

    // Move enemies + enemy fire
    const newEB = [];
    gs.enemies = gs.enemies.map(e => {
      let nx = e.x + e.dx, ndx = e.dx;
      if (nx < 0 || nx + e.w > W) { ndx = -ndx; nx = clamp(nx, 0, W - e.w); }
      if (Math.random() < e.fire * (1 + gs.level * 0.15)) {
        newEB.push({ id: nid(), x: e.x + e.w / 2 - 3, y: e.y + e.h,
                     sp: EBULLET_SPEED + gs.level * 0.1 });
      }
      return { ...e, x: nx, y: e.y + e.sp, dx: ndx };
    }).filter(e => e.y < H + e.h);
    gs.eBullets = [...gs.eBullets, ...newEB]
      .map(b => ({ ...b, y: b.y + b.sp }))
      .filter(b => b.y < H + 20);

    // Player-bullet × enemy collision
    const dead = new Set();
    gs.enemies = gs.enemies.map(e => {
      let hp = e.hp;
      for (const b of gs.bullets) {
        if (!dead.has(b.id) && overlap(b.x, b.y, BW, BH, e.x, e.y, e.w, e.h)) {
          dead.add(b.id);
          if (--hp <= 0) break;
        }
      }
      if (hp < e.hp && hp <= 0) {
        gs.score += e.pts * gs.level;
        gs.exps.push({ id: nid(), x: e.x + e.w / 2, y: e.y + e.h / 2, t: 0, r: e.w * 0.7 });
      }
      return { ...e, hp };
    }).filter(e => e.hp > 0);
    gs.bullets = gs.bullets.filter(b => !dead.has(b.id));

    // Player hit detection
    if (gs.inv <= 0) {
      const hx = gs.px + 9, hy = gs.py + 9, hw = PW - 18, hh = PH - 18;
      const eHit = gs.enemies.some(e  => overlap(hx, hy, hw, hh, e.x, e.y, e.w, e.h));
      const bHit = gs.eBullets.some(b => overlap(hx, hy, hw, hh, b.x, b.y, 6, 14));
      if (eHit || bHit) {
        gs.lives--;
        gs.exps.push({ id: nid(), x: gs.px + PW / 2, y: gs.py + PH / 2, t: 0, r: 48, big: true });
        gs.inv = 130;
        if (eHit) gs.enemies = gs.enemies.filter(
          e => !overlap(hx - 5, hy - 5, hw + 10, hh + 10, e.x, e.y, e.w, e.h)
        );
        if (gs.lives <= 0) {
          gs.hi = Math.max(gs.hi, gs.score);
          sceneRef.current = 'gameover';
          setScene('gameover');
          return; // stop loop
        }
      }
    } else {
      gs.inv--;
    }

    // Update explosions
    gs.exps = gs.exps.map(e => ({ ...e, t: e.t + 1 })).filter(e => e.t < 20);

    // Scroll stars (parallax)
    gs.stars = gs.stars.map(s => ({ ...s, y: s.y + s.sp > H ? -2 : s.y + s.sp }));

    // Level up every 2500 points (max level 8)
    gs.level = Math.min(8, 1 + Math.floor(gs.score / 2500));

    // Re-render at ~30fps (every 2 logic frames)
    if (gs.frame % 2 === 0) setTick(t => t + 1);
    raf.current = requestAnimationFrame(loop);
  }, []);

  const startGame = useCallback(() => {
    g.current = newGame(g.current);
    sceneRef.current = 'playing';
    setScene('playing');
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const gs = g.current;

  return (
    <View style={st.root} {...pan.panHandlers}>
      <StatusBar hidden />

      {/* Scrolling stars */}
      {gs?.stars.map(s => (
        <View key={s.id} style={[st.star, {
          left: s.x, top: s.y,
          width: s.r * 2, height: s.r * 2,
          opacity: s.op,
        }]} />
      ))}

      {/* Enemy bullets */}
      {gs?.eBullets.map(b => (
        <View key={b.id} style={[st.eb, { left: b.x, top: b.y }]} />
      ))}

      {/* Player bullets */}
      {gs?.bullets.map(b => (
        <View key={b.id} style={[st.pb, { left: b.x, top: b.y }]} />
      ))}

      {/* Enemies */}
      {gs?.enemies.map(e => (
        <View key={e.id} style={{ position: 'absolute', left: e.x, top: e.y, width: e.w, height: e.h }}>
          <Text style={{ fontSize: e.w * 0.6, textAlign: 'center' }}>{e.emoji}</Text>
          {e.maxHp > 1 && (
            <View style={[st.hpBg, { width: e.w }]}>
              <View style={[st.hpFg, { width: (e.hp / e.maxHp) * e.w }]} />
            </View>
          )}
        </View>
      ))}

      {/* Player ship (blinks when invincible) */}
      {scene === 'playing' && gs && (
        <View style={[
          st.player,
          { left: gs.px, top: gs.py },
          gs.inv > 0 && gs.inv % 8 < 4 && { opacity: 0.15 },
        ]}>
          <Text style={{ fontSize: 36 }}>🚀</Text>
        </View>
      )}

      {/* Explosion effects */}
      {gs?.exps.map(ex => {
        const p  = ex.t / 20;
        const sz = ex.r * (0.3 + p * 0.7) * 2;
        return (
          <View key={ex.id} style={{
            position: 'absolute',
            left: ex.x - sz / 2,
            top:  ex.y - sz / 2,
            width: sz, height: sz,
            borderRadius: sz / 2,
            backgroundColor: `rgba(255,${Math.floor(180 - p * 180)},0,${1 - p})`,
          }} />
        );
      })}

      {/* HUD */}
      {scene === 'playing' && gs && (
        <View style={st.hud}>
          <Text style={st.hudTxt}>
            {'❤️'.repeat(gs.lives)}{'  '}{gs.score.toLocaleString()}{'  '}Lv.{gs.level}
          </Text>
        </View>
      )}

      {/* ── Title screen ── */}
      {scene === 'title' && (
        <View style={st.ov}>
          <Text style={[st.big, { color: '#fff', fontSize: 34 }]}>🚀 SPACE SHOOTER</Text>
          <Text style={st.sub}>縦スクロールシューティング</Text>

          <View style={st.infoBox}>
            <Text style={st.infoRow}>👾 ザコ敵  +100 × Lv.</Text>
            <Text style={st.infoRow}>🛸 中型機  +300 × Lv.</Text>
            <Text style={st.infoRow}>💀 大型機  +800 × Lv.</Text>
          </View>

          <TouchableOpacity style={st.btn} onPress={startGame}>
            <Text style={st.btnTxt}>ゲームスタート</Text>
          </TouchableOpacity>

          <Text style={st.hint}>
            {'画面をタッチ＆ドラッグで移動\n弾は自動発射　Lv.2から3方向弾\nLv.4から5方向弾！'}
          </Text>
        </View>
      )}

      {/* ── Game over screen ── */}
      {scene === 'gameover' && gs && (
        <View style={st.ov}>
          <Text style={[st.big, { color: '#FF4444', fontSize: 42 }]}>GAME OVER</Text>
          <Text style={{ color: '#fff', fontSize: 26, marginTop: 8 }}>
            スコア: {gs.score.toLocaleString()}
          </Text>
          {gs.hi > 0 && (
            <Text style={{ color: '#FFD700', fontSize: 20 }}>
              ハイスコア: {gs.hi.toLocaleString()}
            </Text>
          )}
          <Text style={{ color: '#aaa', fontSize: 16 }}>到達レベル: {gs.level}</Text>
          <TouchableOpacity style={[st.btn, { marginTop: 28 }]} onPress={startGame}>
            <Text style={st.btnTxt}>もう一度</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#04080F', overflow: 'hidden' },
  star:   { position: 'absolute', backgroundColor: '#fff', borderRadius: 99 },
  pb:     { position: 'absolute', width: BW, height: BH, backgroundColor: '#00F0FF', borderRadius: 3 },
  eb:     { position: 'absolute', width: 6, height: 14,  backgroundColor: '#FF3344', borderRadius: 3 },
  player: { position: 'absolute', width: PW, height: PH, alignItems: 'center', justifyContent: 'center' },
  hpBg:   { height: 3, backgroundColor: '#222' },
  hpFg:   { height: 3, backgroundColor: '#44FF44' },
  hud: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 50,
    left: 0, right: 0,
    alignItems: 'center',
  },
  hudTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 6 },
  ov: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.87)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  big:    { fontWeight: 'bold' },
  sub:    { color: '#aaa', fontSize: 16 },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginVertical: 8,
    gap: 4,
  },
  infoRow: { color: '#ccc', fontSize: 14 },
  hint: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 22, marginTop: 4 },
  btn:    { backgroundColor: '#6C63FF', paddingHorizontal: 52, paddingVertical: 16, borderRadius: 30, marginTop: 12 },
  btnTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
