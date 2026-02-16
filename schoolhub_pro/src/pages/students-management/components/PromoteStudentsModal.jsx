import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PromoteStudentsModal = ({ isOpen, onClose, onSubmit, count, classOptions, sectionOptions }) => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [filteredSections, setFilteredSections] = useState([]);

    useEffect(() => {
        if (selectedClass) {
            const sections = sectionOptions.filter(s => s.classId === selectedClass);
            setFilteredSections(sections);
            if (sections.length > 0) {
                setSelectedSection(sections[0].value);
            } else {
                setSelectedSection('');
            }
        } else {
            setFilteredSections([]);
            setSelectedSection('');
        }
    }, [selectedClass, sectionOptions]);

    const handleSubmit = () => {
        if (!selectedClass || !selectedSection) return;
        onSubmit({ classId: selectedClass, sectionId: selectedSection });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Promote Students"
        >
            <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-primary mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            You are about to promote {count} student{count !== 1 ? 's' : ''}.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select the target class and section where these students will be moved.
                            Their current academic records (grades, attendance) will remain linked to their previous class/year history.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Select
                        label="Target Class"
                        value={selectedClass}
                        onChange={setSelectedClass}
                        options={classOptions}
                        placeholder="Select Class"
                    />

                    <Select
                        label="Target Section"
                        value={selectedSection}
                        onChange={setSelectedSection}
                        options={filteredSections}
                        placeholder="Select Section"
                        disabled={!selectedClass}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedClass || !selectedSection}
                    >
                        Promote Students
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PromoteStudentsModal;
