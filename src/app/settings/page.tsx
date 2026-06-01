"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Trash2, 
  Check, 
  Sliders,
  CheckSquare,
  Square,
  GripVertical
} from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CustomField {
  id: string;
  label: string;
}

interface UserSettings {
  lastNameEnabled: boolean;
  lastNameRequired: boolean;
  firstNameEnabled: boolean;
  firstNameRequired: boolean;
  patronymicEnabled: boolean;
  patronymicRequired: boolean;
  birthDateEnabled: boolean;
  birthDateRequired: boolean;
  genderEnabled: boolean;
  genderRequired: boolean;
  regionEnabled: boolean;
  regionRequired: boolean;
  priorityFields: CustomField[]; // Max 5
  secondaryFields: CustomField[]; // Unlimited
}

const DEFAULT_SETTINGS: UserSettings = {
  lastNameEnabled: true,
  lastNameRequired: true,
  firstNameEnabled: true,
  firstNameRequired: true,
  patronymicEnabled: true,
  patronymicRequired: false,
  birthDateEnabled: true,
  birthDateRequired: false,
  genderEnabled: true,
  genderRequired: false,
  regionEnabled: false,
  regionRequired: false,
  priorityFields: [
    { id: 'p_branch', label: 'Филиал' },
    { id: 'p_dept', label: 'Департамент' },
    { id: 'p_div', label: 'Отдел' },
    { id: 'p_role', label: 'Должность' },
    { id: 'p_status', label: 'Статус' }
  ],
  secondaryFields: [
    { id: 's_gender', label: 'Пол' },
    { id: 's_age', label: 'Возраст' }
  ]
};

function SortableFieldRow({ 
  field, 
  onLabelChange, 
  onDelete, 
  placeholder 
}: { 
  field: CustomField; 
  onLabelChange: (val: string) => void; 
  onDelete: () => void; 
  placeholder: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 bg-white border rounded-xl transition-all duration-200 ${
        isDragging
          ? 'opacity-30 border-dashed border-2 border-[var(--color-admin-primary-300)] scale-[0.98] bg-neutral-50 shadow-inner z-50' 
          : 'border-neutral-200 hover:border-neutral-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] shadow-sm'
      }`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing p-1 touch-none"
      >
        <GripVertical className="w-4 h-4 shrink-0" />
      </div>
      <div className="flex-1">
        <input 
          type="text" 
          value={field.label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-800 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-admin-primary-100)] focus:border-[var(--color-admin-primary-500)] transition-all shadow-sm"
        />
      </div>
      <button 
        onClick={onDelete}
        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
        title="Удалить поле"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);

  // Custom Deletion Modal States
  const [fieldToDelete, setFieldToDelete] = useState<{ id: string, label: string, type: 'priority' | 'secondary' } | null>(null);

  // DND active states
  const [activePriorityId, setActivePriorityId] = useState<string | null>(null);
  const [activeSecondaryId, setActiveSecondaryId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const saved = localStorage.getItem('osnova_user_settings');
    if (saved) {
      try {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved)
        });
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('osnova_user_settings', JSON.stringify(newSettings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggleField = (field: keyof UserSettings, type: 'enabled' | 'required') => {
    const enabledKey = field as keyof UserSettings;
    const requiredKey = `${String(field).replace('Enabled', '')}Required` as keyof UserSettings;
    
    const updated = { ...settings };
    if (type === 'enabled') {
      updated[enabledKey] = !updated[enabledKey] as any;
      if (!updated[enabledKey]) {
        updated[requiredKey] = false as any;
      }
    } else {
      if (!updated[enabledKey]) return;
      updated[requiredKey] = !updated[requiredKey] as any;
    }
    saveSettings(updated);
  };

  const handleUpdatePriorityLabel = (id: string, label: string) => {
    const updatedPriority = settings.priorityFields.map(f => f.id === id ? { ...f, label } : f);
    saveSettings({
      ...settings,
      priorityFields: updatedPriority
    });
  };

  const confirmDeleteField = () => {
    if (!fieldToDelete) return;
    const { id, type } = fieldToDelete;
    if (type === 'priority') {
      const updatedPriority = settings.priorityFields.filter(f => f.id !== id);
      saveSettings({
        ...settings,
        priorityFields: updatedPriority
      });
    } else {
      const updatedSecondary = settings.secondaryFields.filter(f => f.id !== id);
      saveSettings({
        ...settings,
        secondaryFields: updatedSecondary
      });
    }
    setFieldToDelete(null);
  };

  const handleAddPriorityField = () => {
    if (settings.priorityFields.length >= 5) return;
    const newId = `p_${Date.now()}`;
    const updatedPriority = [...settings.priorityFields, { id: newId, label: '' }];
    saveSettings({
      ...settings,
      priorityFields: updatedPriority
    });
  };

  const handleAddSecondaryField = () => {
    const newId = `s_${Date.now()}`;
    const updatedSecondary = [...settings.secondaryFields, { id: newId, label: '' }];
    saveSettings({
      ...settings,
      secondaryFields: updatedSecondary,
    });
  };

  const handleUpdateSecondaryLabel = (id: string, label: string) => {
    const updatedSecondary = settings.secondaryFields.map(f => f.id === id ? { ...f, label } : f);
    saveSettings({
      ...settings,
      secondaryFields: updatedSecondary
    });
  };

  const handleResetToDefault = () => {
    if (confirm('Вы уверены, что хотите сбросить все настройки по умолчанию?')) {
      saveSettings(DEFAULT_SETTINGS);
    }
  };

  const handleDragStartPriority = (event: DragStartEvent) => {
    setActivePriorityId(event.active.id as string);
  };

  const handleDragEndPriority = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = settings.priorityFields.findIndex(f => f.id === active.id);
      const newIndex = settings.priorityFields.findIndex(f => f.id === over.id);
      const updated = arrayMove(settings.priorityFields, oldIndex, newIndex);
      saveSettings({ ...settings, priorityFields: updated });
    }
    setActivePriorityId(null);
  };

  const handleDragStartSecondary = (event: DragStartEvent) => {
    setActiveSecondaryId(event.active.id as string);
  };

  const handleDragEndSecondary = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = settings.secondaryFields.findIndex(f => f.id === active.id);
      const newIndex = settings.secondaryFields.findIndex(f => f.id === over.id);
      const updated = arrayMove(settings.secondaryFields, oldIndex, newIndex);
      saveSettings({ ...settings, secondaryFields: updated });
    }
    setActiveSecondaryId(null);
  };

  const standardFields = [
    { label: 'Фамилия', enabledKey: 'lastNameEnabled' as const, requiredKey: 'lastNameRequired' as const },
    { label: 'Имя', enabledKey: 'firstNameEnabled' as const, requiredKey: 'firstNameRequired' as const },
    { label: 'Отчество', enabledKey: 'patronymicEnabled' as const, requiredKey: 'patronymicRequired' as const },
    { label: 'Дата рождения', enabledKey: 'birthDateEnabled' as const, requiredKey: 'birthDateRequired' as const },
    { label: 'Пол', enabledKey: 'genderEnabled' as const, requiredKey: 'genderRequired' as const },
    { label: 'Регион', enabledKey: 'regionEnabled' as const, requiredKey: 'regionRequired' as const }
  ];

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--bg-app)] pb-0 text-neutral-800 animate-in fade-in duration-200">
      <PageHeader title="Настройки" />

      <div className="flex-1 w-full max-w-[1000px] mx-auto px-6 lg:px-8 mt-6 flex flex-col gap-6 pb-16">
        
        {/* Title and Reset button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Настройки полей пользователей</h1>
            <p className="text-[13px] text-neutral-450 mt-1 font-semibold">Настройте обязательность стандартных полей и создайте кастомные атрибуты профиля.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Настройки сохранены
              </span>
            )}
            <Button variant="outline" onClick={handleResetToDefault} className="text-neutral-500 hover:text-neutral-700 h-9 font-medium text-xs">
              Сбросить по умолчанию
            </Button>
          </div>
        </div>

        {/* Core fields setup */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-[15px] font-bold text-neutral-900 mb-5 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[var(--color-admin-primary-500)]" />
            Обязательность и видимость стандартных полей
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Поле</th>
                  <th className="py-3 px-4 font-semibold text-center w-36">Видимость</th>
                  <th className="py-3 px-4 font-semibold text-center w-36">Обязательно</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {standardFields.map((f) => {
                  const isEnabled = settings[f.enabledKey];
                  const isRequired = settings[f.requiredKey];
                  return (
                    <tr key={f.label} className="hover:bg-neutral-50/45 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-800 text-[13px]">{f.label}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center items-center">
                          <div 
                            onClick={() => handleToggleField(f.enabledKey, 'enabled')} 
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center ${isEnabled ? 'bg-[#1A1A1A]' : 'bg-neutral-200'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${isEnabled ? 'translate-x-5' : ''}`} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center items-center">
                          <div 
                            onClick={() => handleToggleField(f.enabledKey, 'required')}
                            className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer ${
                              !isEnabled 
                                ? 'opacity-30 cursor-not-allowed border-neutral-200 bg-neutral-50' 
                                : isRequired 
                                  ? 'bg-[#1A1A1A] border-[#1A1A1A]' 
                                  : 'border-neutral-300 bg-white hover:border-neutral-400'
                            }`}
                          >
                            {isRequired && isEnabled && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Custom Fields (Filters) */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex justify-between items-center gap-4 mb-5">
            <h2 className="text-[15px] font-bold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--color-admin-primary-500)]" />
              Приоритетные поля
            </h2>
            
            {settings.priorityFields.length < 5 && (
              <Button onClick={handleAddPriorityField} className="flex items-center gap-1.5 h-8 font-semibold text-xs rounded-lg px-3 shrink-0">
                <Plus className="w-3.5 h-3.5" /> Добавить
              </Button>
            )}
          </div>

          <DndContext sensors={sensors} onDragStart={handleDragStartPriority} onDragEnd={handleDragEndPriority} collisionDetection={closestCorners}>
            <SortableContext items={settings.priorityFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2.5">
                {settings.priorityFields.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-450 border border-dashed border-neutral-200 rounded-xl">
                    Приоритетные поля не созданы. Добавьте хотя бы одно поле.
                  </div>
                ) : (
                  settings.priorityFields.map((field) => (
                    <SortableFieldRow 
                      key={field.id}
                      field={field}
                      onLabelChange={(val) => handleUpdatePriorityLabel(field.id, val)}
                      onDelete={() => setFieldToDelete({ id: field.id, label: field.label, type: 'priority' })}
                      placeholder="Введите название поля"
                    />
                  ))
                )}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activePriorityId ? (
                <div className="flex items-center gap-4 p-3 bg-white border border-[var(--color-admin-primary-400)] rounded-xl shadow-lg opacity-85 scale-[1.02] z-50">
                  <div className="text-neutral-400 p-1">
                    <GripVertical className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={settings.priorityFields.find(f => f.id === activePriorityId)?.label || ''}
                      readOnly
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-800 font-bold outline-none"
                    />
                  </div>
                  <button className="p-2 text-neutral-300 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Secondary Custom Fields */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex justify-between items-center gap-4 mb-5">
            <h2 className="text-[15px] font-bold text-neutral-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--color-admin-primary-500)]" />
              Дополнительные поля
            </h2>
            <Button onClick={handleAddSecondaryField} className="flex items-center gap-1.5 h-8 font-semibold text-xs rounded-lg px-3 shrink-0">
              <Plus className="w-3.5 h-3.5" /> Добавить
            </Button>
          </div>

          <DndContext sensors={sensors} onDragStart={handleDragStartSecondary} onDragEnd={handleDragEndSecondary} collisionDetection={closestCorners}>
            <SortableContext items={settings.secondaryFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2.5">
                {settings.secondaryFields.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-450 border border-dashed border-neutral-200 rounded-xl">
                    Дополнительные поля не созданы.
                  </div>
                ) : (
                  settings.secondaryFields.map((field) => (
                    <SortableFieldRow 
                      key={field.id}
                      field={field}
                      onLabelChange={(val) => handleUpdateSecondaryLabel(field.id, val)}
                      onDelete={() => setFieldToDelete({ id: field.id, label: field.label, type: 'secondary' })}
                      placeholder="Введите название поля"
                    />
                  ))
                )}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeSecondaryId ? (
                <div className="flex items-center gap-4 p-3 bg-white border border-[var(--color-admin-primary-400)] rounded-xl shadow-lg opacity-85 scale-[1.02] z-50">
                  <div className="text-neutral-400 p-1">
                    <GripVertical className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={settings.secondaryFields.find(f => f.id === activeSecondaryId)?.label || ''}
                      readOnly
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-800 font-bold outline-none"
                    />
                  </div>
                  <button className="p-2 text-neutral-300 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

      </div>

      {/* Premium Custom Deletion Modal */}
      {fieldToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setFieldToDelete(null)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-5">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Удалить поле?</h3>
            
            <p className="text-[13px] text-neutral-500 leading-relaxed mb-6">
              Вы действительно хотите безвозвратно удалить поле <span className="font-bold text-neutral-800">"{fieldToDelete.label || 'Без названия'}"</span>? Все данные, связанные с этим полем, будут удалены.
            </p>

            <div className="w-full grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setFieldToDelete(null)}
                className="w-full h-11 font-bold text-xs rounded-xl border-neutral-200 hover:bg-neutral-50"
              >
                Отмена
              </Button>
              <Button 
                onClick={confirmDeleteField}
                className="w-full h-11 font-bold text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
