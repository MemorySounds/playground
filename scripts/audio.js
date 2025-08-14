  const audio = document.getElementById('background-audio');
    const audioBtn = document.getElementById('audio-toggle');
    const progress = document.getElementById('audio-progress');
    const playIcon = document.getElementById('play-icon');
    const stopIcon = document.getElementById('stop-icon');
    const timeRemaining = document.getElementById('time-remaining');

    // Format time in MM:SS
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Play/pause button
    audioBtn.onclick = () => {
      if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        stopIcon.style.display = 'block';
      } else {
        audio.pause();
        playIcon.style.display = 'block';
        stopIcon.style.display = 'none';
      }
    };

    // Update progress bar and time display as audio plays
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.value = progressPercent;
        
        // Calculate remaining time
        const remaining = audio.duration - audio.currentTime;
        timeRemaining.textContent = formatTime(remaining);
      }
    });

    // Update time display when audio metadata loads
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration) {
        timeRemaining.textContent = formatTime(audio.duration);
      }
    });

    // Seek when user moves the slider
    progress.addEventListener('input', () => {
      if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
      }
    });

    // Unlock audio on first user gesture
    function unlockAudio() {
      audio.play().then(() => {
        playIcon.style.display = 'none';
        stopIcon.style.display = 'block';
      }).catch(() => {});
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    }
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);