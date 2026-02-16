import React from 'react';
import Icon from '../../../components/AppIcon';

const AppearanceSettings = ({ settings, onChange }) => {
    const themes = [
        { id: 'light', label: 'Light', icon: 'Sun' },
        { id: 'dark', label: 'Dark', icon: 'Moon' },
        { id: 'system', label: 'System', icon: 'Monitor' }
    ];

    const colors = [
        { id: 'blue', value: '#1E40AF', label: 'Blue (Default)' },
        { id: 'violet', value: '#7C3AED', label: 'Violet' },
        { id: 'amber', value: '#D97706', label: 'Amber' }, // Using warning color
        { id: 'emerald', value: '#059669', label: 'Emerald' }, // Using success color
        { id: 'rousseau', value: '#7D1226', label: 'Rousseau' }, // Slightly redder burgundy
        { id: 'cyan', value: '#0891B2', label: 'Cyan' },
        { id: 'slate', value: '#475569', label: 'Slate' }
    ];

    const handleThemeChange = (themeId) => {
        onChange({ ...settings, theme: themeId });
    };

    const handleColorChange = (colorValue) => {
        onChange({ ...settings, primaryColor: colorValue });
    };

    return (
        <div className="space-y-8">
            {/* Theme Selection */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon name="Layout" size={24} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Theme Preference</h3>
                        <p className="text-sm text-muted-foreground">Choose how the application looks to you.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${settings.theme === theme.id
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                                }`}
                        >
                            <Icon name={theme.icon} size={32} className="mb-3" />
                            <span className="font-medium">{theme.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Primary Color Selection */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon name="Palette" size={24} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Accent Color</h3>
                        <p className="text-sm text-muted-foreground">Select a primary color for buttons and highlights.</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                        {colors.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => handleColorChange(color.value)}
                                className={`group relative flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all ${settings.primaryColor === color.value
                                    ? 'bg-muted ring-2 ring-primary ring-offset-2 ring-offset-card'
                                    : 'hover:bg-muted'
                                    }`}
                            >
                                <div
                                    className="w-10 h-10 rounded-full shadow-sm border border-border/10"
                                    style={{ backgroundColor: color.value }}
                                />
                                <span className={`text-xs font-medium ${settings.primaryColor === color.value ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                    {color.label}
                                </span>

                                {settings.primaryColor === color.value && (
                                    <div className="absolute top-2 right-2 flex justify-center w-full h-full items-center pointer-events-none">
                                        <Icon name="Check" size={16} className="text-white drop-shadow-md" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-2">Preview</h4>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
                                Primary Button
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-foreground font-medium text-sm">
                                Secondary Button
                            </button>
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                <Icon name="Sparkles" size={16} />
                                <span>Badge</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AppearanceSettings;
