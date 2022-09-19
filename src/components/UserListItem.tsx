import { useEffect, useState } from 'react'
import { postRequest } from '../utils/api-requests';
import { UserEntry } from '../utils/interfaces';

interface UserListItemProps {
    userEntry: UserEntry;
    is_admin: boolean
}

export const UserListItem: React.FC<UserListItemProps> = ({userEntry, is_admin}) => {
    const [userEntryData, setUserEntryData] = useState<UserEntry>(userEntry);
    const [deleteIntention, setDeleteIntention] = useState<boolean>(false);
    const [deleteButtonText, setDeleteButtonText] = useState<string>('Delete');
    useEffect(() => {
        setUserEntryData(userEntry);
    },[userEntry]);

    function queueEntryChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
        setUserEntryData(prevUserData => {
            const { name, checked } = event.target;
            let newUserData = {...prevUserData, [name]: checked};
            return newUserData;
        });
    };

    function changeUser(){
        if(is_admin){
            postRequest('admin/changeUser', '5100', JSON.stringify(userEntryData));
        }
    };

    function deleteUser(){
        if(is_admin){
            if(deleteIntention){
                postRequest('admin/deleteUser', '5100', JSON.stringify({id: userEntryData.id}));
                setDeleteButtonText('Deleted');
                setDeleteIntention(false);
            }else{
                setDeleteButtonText('Sure?');
                setDeleteIntention(true);
            }
        }
    }

    return (
        <div className='user-entry'>
            <b>{userEntryData.login}</b>
            <div className="checkboxes">
                <input type='checkbox' name='is_mod' checked={userEntryData.is_mod} onChange={queueEntryChangeEvent} />
                <label htmlFor='is_mod'>is_mod</label>
                <input type='checkbox' name='is_admin' checked={userEntryData.is_admin} onChange={queueEntryChangeEvent} />
                <label htmlFor='is_admin'>is_admin</label>
                <input type='checkbox' name='is_cthulhu' checked={userEntryData.is_cthulhu} onChange={queueEntryChangeEvent} />
                <label htmlFor='is_cthulhu'>is_cthulhu</label>
                <input type='checkbox' name='is_queen' checked={userEntryData.is_queen} onChange={queueEntryChangeEvent} />
                <label htmlFor='is_queen'>is_queen</label>
            </div>
            <button className='change-button' onClick={changeUser}>Change</button>
            <button className='delete-button' onClick={deleteUser}>{deleteButtonText}</button>
        </div>
    );
}