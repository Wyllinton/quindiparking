import { Component, EventEmitter, OnInit, Output } from '@angular/core';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  dyslexiaFont: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'qp_accessibility';
const DEFAULT: AccessibilitySettings = { fontSize: 16, highContrast: false, grayscale: false, highlightLinks: false, dyslexiaFont: false, reduceMotion: false };

@Component({
  selector: 'qp-accessibility-panel',
  standalone: false,
  templateUrl: './accessibility-panel.component.html',
  styleUrl: './accessibility-panel.component.scss'
})
export class AccessibilityPanelComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  settings: AccessibilitySettings = { ...DEFAULT };

  ngOnInit(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.settings = { ...DEFAULT, ...JSON.parse(saved) };
    }
    this.applyAll();
  }

  increaseFontSize(): void {
    if (this.settings.fontSize < 24) {
      this.settings.fontSize += 2;
      this.save();
    }
  }

  decreaseFontSize(): void {
    if (this.settings.fontSize > 12) {
      this.settings.fontSize -= 2;
      this.save();
    }
  }

  resetFontSize(): void {
    this.settings.fontSize = 16;
    this.save();
  }

  toggleHighContrast(): void {
    this.settings.highContrast = !this.settings.highContrast;
    this.save();
  }

  toggleGrayscale(): void {
    this.settings.grayscale = !this.settings.grayscale;
    this.save();
  }

  toggleHighlightLinks(): void {
    this.settings.highlightLinks = !this.settings.highlightLinks;
    this.save();
  }

  toggleDyslexiaFont(): void {
    this.settings.dyslexiaFont = !this.settings.dyslexiaFont;
    this.save();
  }

  toggleReduceMotion(): void {
    this.settings.reduceMotion = !this.settings.reduceMotion;
    this.save();
  }

  resetAll(): void {
    this.settings = { ...DEFAULT };
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    this.applyAll();
  }

  private applyAll(): void {
    const body = document.body;
    document.documentElement.style.fontSize = `${this.settings.fontSize}px`;
    body.classList.toggle('high-contrast', this.settings.highContrast);
    body.classList.toggle('grayscale', this.settings.grayscale);
    body.classList.toggle('highlight-links', this.settings.highlightLinks);
    body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont);
    body.classList.toggle('reduce-motion', this.settings.reduceMotion);
  }
}


