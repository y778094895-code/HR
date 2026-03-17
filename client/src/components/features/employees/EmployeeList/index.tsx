import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeListPage from './EmployeeListPage';
import useEmployees from '../hooks/useEmployees';

const EmployeeListContainer: React.FC = () => {
    const navigate = useNavigate();
    const {
        employees,
        loading,
        updateParams,
        deleteEmployee
    } = useEmployees();

    const [searchTerm, setSearchTerm] = React.useState('');

    // Debounce search term
    React.useEffect(() => {
        const timer = setTimeout(() => {
            updateParams({ search: searchTerm });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, updateParams]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleAdd = () => {
        // Logic for opening add modal
        console.log('Add employee clicked');
    };

    const handleViewProfile = (id: string) => {
        navigate(`/dashboard/employees/${id}`);
    };

    return (
        <EmployeeListPage
            employees={employees}
            loading={loading}
            onSearch={handleSearch}
            onAdd={handleAdd}
            onDelete={deleteEmployee}
            onViewProfile={handleViewProfile}
        />
    );
};

export default EmployeeListContainer;
