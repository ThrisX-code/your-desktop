export function playAlarm() {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  const playBeep = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, time);
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.start(time);
    osc.stop(time + 0.15);
  };

  // Schedule alarm pattern for 15 seconds
  const duration = 15;
  let time = ctx.currentTime;
  
  while (time < ctx.currentTime + duration) {
    playBeep(time);
    playBeep(time + 0.25);
    playBeep(time + 0.5);
    time += 1.25; // Repeat pattern every 1.25 seconds
  }
  
  const playEndBeep = (t: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1320, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.4);
  };
  
  playEndBeep(time);
}
