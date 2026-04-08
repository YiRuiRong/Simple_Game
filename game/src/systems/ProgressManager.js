const STORAGE_KEY = 'cute-td-progress';

const DEFAULT_PROGRESS = {
  unlockedLevel: 1,
  stars: {},
};

export class ProgressManager {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
    } catch (e) {
      // Ignore parse errors
    }
    return { ...DEFAULT_PROGRESS };
  }

  static save(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      // Ignore storage errors
    }
  }

  static getUnlockedLevel() {
    return this.load().unlockedLevel;
  }

  static getStars(levelId) {
    const progress = this.load();
    return progress.stars[levelId] || 0;
  }

  static setStars(levelId, stars) {
    const progress = this.load();
    const current = progress.stars[levelId] || 0;
    if (stars > current) {
      progress.stars[levelId] = stars;
      this.save(progress);
    }
  }

  static unlockNext(currentLevelId) {
    const progress = this.load();
    if (currentLevelId >= progress.unlockedLevel) {
      progress.unlockedLevel = currentLevelId + 1;
      this.save(progress);
    }
  }

  static completeLevel(levelId, stars) {
    this.setStars(levelId, stars);
    this.unlockNext(levelId);
  }

  static reset() {
    this.save({ ...DEFAULT_PROGRESS });
  }
}
