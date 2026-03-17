import React from 'react';
import UserManagement from './UserManagement';
import useUsers, { User } from '../hooks/useUsers';

const UserManagementContainer: React.FC = () => {
    const {
        users,
        loading,
        deleteUser
    } = useUsers();

    const handleAdd = () => {
        console.log('Add user clicked');
    };

    const handleEdit = (user: User) => {
        console.log('Edit user clicked', user);
    };

    return (
        <UserManagement
            users={users}
            loading={loading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={deleteUser}
        />
    );
};

export default UserManagementContainer;
