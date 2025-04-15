

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService, UserSettings } from '../services/setting-service.service';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputSwitchModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  providers: [MessageService]
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isSaving = false;
  
  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Italian', value: 'it' }
  ];
  
  displayModeOptions = [
    { label: 'Grid', value: 'grid' },
    { label: 'List', value: 'list' }
  ];
  
  themeOptions = [
    { label: 'Dark Theme', value: 'dark-theme' },
    { label: 'Summer Theme', value: 'summer-theme' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private messageService: MessageService
  ) {
    this.settingsForm = this.fb.group({
      theme: [''],
      language: [''],
      notifications: [true],
      displayMode: ['grid']
    });
  }
  
  ngOnInit(): void {
    // Load settings into form
    this.settingsService.settings$.subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });
  }
  
  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.isSaving = true;
      
      const formValues = this.settingsForm.value;
      const updatePromises: Promise<any>[] = [];
      
      // Only update changed fields
      Object.keys(formValues).forEach(key => {
        const typedKey = key as keyof UserSettings;
        const currentValue = this.settingsService.getSetting(typedKey);
        
        if (currentValue !== formValues[typedKey]) {
          updatePromises.push(
            this.settingsService.updateSetting(typedKey, formValues[typedKey]).toPromise()
          );
        }
      });
      
      Promise.all(updatePromises)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Settings Saved',
            detail: 'Your preferences have been updated.'
          });
        })
        .catch(error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: 'Could not update settings. Please try again.'
          });
        })
        .finally(() => {
          this.isSaving = false;
        });
    }
  }
}
