import React, { useState, useEffect } from 'react';
import Select from '../ui/Select';
import academicYearService from '../../services/academicYearService';

const AcademicYearFilter = ({ selectedYear, onChange, showAllOption = true, label = "Academic Year", className = "" }) => {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            setLoading(true);
            const data = await academicYearService.getAll();
            const formattedYears = data.map(year => ({
                value: year._id || year.id,
                label: `${year.name} (${year.status})`
            }));

            if (showAllOption) {
                setYears([{ value: '', label: 'All Years' }, ...formattedYears]);
            } else {
                setYears(formattedYears);
            }
        } catch (err) {
            console.error('Error fetching academic years:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={className}>
            <Select
                label={label}
                options={years}
                value={selectedYear}
                onChange={onChange}
                disabled={loading}
                placeholder={loading ? "Loading years..." : "Select Year"}
            />
        </div>
    );
};

export default AcademicYearFilter;
