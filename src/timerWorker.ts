let timerId: number | null = null;

self.onmessage = (e) => {
  if (e.data.action === 'start') {
    if (timerId) clearInterval(timerId);
    let seconds = e.data.seconds;
    timerId = self.setInterval(() => {
      seconds--;
      self.postMessage({ type: 'tick', seconds });
      if (seconds <= 0) {
        if (timerId) clearInterval(timerId);
        self.postMessage({ type: 'done' });
      }
    }, 1000);
  } else if (e.data.action === 'stop') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
};
