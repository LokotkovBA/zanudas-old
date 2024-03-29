import { AxiosError } from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import { z } from 'zod';
import { useTypedSelector } from '../hooks/redux';

import daIconPath from '../icons/da.svg';
import { BACKEND_ADDRESS, getRequest, patchRequest, postRequest, putRequest } from '../utils/api-requests';
import { socket } from '../utils/socket-client';
import { Alert } from './Alert';


const daLink = `https://${BACKEND_ADDRESS}:5100/da/auth`;

const adminGetTokens = `https://${BACKEND_ADDRESS}:5100/admin/adminTwitchToken`;

interface AdminMenuProps {
    is_live: boolean;
}

const adminDataSchema = z.object({
    centrifuge_is_setup: z.boolean(),
    fontSize: z.string(),
    hid_token_buttons: z.boolean(),
    is_listening_da: z.boolean(),
    max_display: z.number(),
    showInfo: z.boolean(),
    textInfo: z.string(),
});

let successCount = 0;

export const AdminMenu: React.FC<AdminMenuProps> = ({ is_live }) => {
    const is_admin = useTypedSelector(state => state.auth.userData.is_admin);
    const display_name = useTypedSelector(state => state.auth.userData.display_name);
    const [newMaxDisplay, setNewMaxDisplay] = useState<number>(0);
    const [newFontSize, setNewFontSize] = useState<string>('');
    const [infoText, setInfoText] = useState<string>('');
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [isSetupDA, setIsSetupDA] = useState<boolean>(false);
    const [isListeningToDA, setIsListeningToDA] = useState<boolean>(false);
    const [HidTokenButtons, setHidTokenButtons] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [sliding, setSliding] = useState<boolean>(false);

    function onMaxDisplayChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewMaxDisplay(parseInt(event.target.value));
    }

    function onFontSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewFontSize(event.target.value);
    }

    function onTextInfoAreaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setInfoText(event.target.value);
    }

    function onShowInfoChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (is_admin) {
            hideInfoText.mutate(event.target.checked);
        }
        setShowInfo(event.target.checked);
    }

    const getAdminData = useQuery(['admin-data'], async () => adminDataSchema.parse((await getRequest('admin')).data), {
        enabled: is_admin,
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            setInfoText(data.textInfo);
            setShowInfo(data.showInfo);
            setNewFontSize(data.fontSize);
            setIsSetupDA(data.centrifuge_is_setup);
            setIsListeningToDA(data.is_listening_da);
            setHidTokenButtons(data.hid_token_buttons);
            setNewMaxDisplay(data.max_display);
        }
    });


    useEffect(() => {
        if (display_name) {
            socket.emit('sub admin', display_name);
            socket.on('connect', () => {
                socket.emit('sub admin', display_name);
            });
        }
        return () => {
            if (display_name) {
                socket.emit('sub admin', display_name);
                socket.on('connect', () => {
                    socket.emit('sub admin', display_name);
                });
            }
        };
    }, [display_name]);

    useEffect(() => {
        socket.on('max display changed', (data) => {
            setNewMaxDisplay(data);
        });
        socket.on('font size changed', (data) => {
            setNewFontSize(data);
        });
        socket.on('show info text', (data) => {
            setShowInfo(data);
        });
        socket.on('change info text', (data) => {
            setInfoText(data);
        });
        socket.on('change da listening status', (data) => {
            setIsListeningToDA(data);
        });
        socket.on('change da setup status', (data) => {
            setIsSetupDA(data);
        });
        socket.on('change hid token buttons', (data) => {
            setHidTokenButtons(data);
        });
        return () => {
            socket.off('max display changed');
            socket.off('font size changed');
            socket.off('show info text');
            socket.off('change info text');
            socket.off('change da listening status');
            socket.off('change da setup status');
            socket.off('change hid token buttons');
        };
    }, []);

    const options = useMemo(() => {
        return {
            onError: (error: AxiosError) => {
                setAlertMessage(error.message);
                setSliding(true);
            },
            onSuccess: () => {
                setSliding(true);
                setAlertMessage('Success!');
                successCount++;
                setTimeout(() => {
                    successCount--;
                    if (!successCount) {
                        setSliding(false);
                    }
                }, 1000);
            }
        };
    }, []);

    const hideInfoText = useMutation((newData: boolean) => patchRequest('admin/infoText', { show_info: newData }), options);
    const setupDaRequest = useMutation(() => postRequest('da/setup', {}), options);
    const startDaRequest = useMutation(() => postRequest('da/start', {}), options);
    const stopDARequest = useMutation(() => postRequest('da/stop', {}), options);
    const getTwitchModsRequest = useMutation(() => getRequest('admin/twitchMods'), options);
    const sendNewMaxDisplayRequest = useMutation((newData: number) => putRequest('admin/maxDisplay', { new_max_display: newData }), options);
    const sendNewFontSizeRequest = useMutation((newData: string) => putRequest('admin/fontSize', { fontSize: newData }), options);
    const startQueueRequest = useMutation(() => postRequest('queue/start', {}), options);
    const stopQueueRequest = useMutation(() => postRequest('queue/stop', {}), options);
    const addQueueSongRequest = useMutation(() => postRequest('queue/empty', {}), options);
    const changeInfoRequest = useMutation((newData: string) => putRequest('admin/infoText', { infoText: newData }), options);
    const tokenButtonsVisibilityRequest = useMutation((newData: boolean) => postRequest('admin/tokenButtonsVisibility', { hid_token_buttons: !newData }), options);

    if (getAdminData.isLoading) {
        return (
            <div className="loader">
                <div className="loader__circle" />
            </div>);
    }

    function setupDA() {
        if (is_admin) {
            setupDaRequest.mutate();
        }
    }

    function startDA() {
        if (is_admin) {
            startDaRequest.mutate();
        }
    }

    function stopDA() {
        if (is_admin) {
            stopDARequest.mutate();
        }
    }

    function getTwitchMods() {
        if (is_admin) {
            getTwitchModsRequest.mutate();
        }
    }

    function startQueue() {
        if (is_admin) {
            startQueueRequest.mutate();
        }
    }

    function stopQueue() {
        if (is_admin) {
            stopQueueRequest.mutate();
        }
    }

    function addQueueSong() {
        if (is_admin) {
            addQueueSongRequest.mutate();
        }
    }

    function changeInfo() {
        if (is_admin) {
            changeInfoRequest.mutate(infoText);
        }
    }

    function sendNewMaxDisplay() {
        if (is_admin) {
            sendNewMaxDisplayRequest.mutate(newMaxDisplay);
        }
    }

    function sendNewFontSize() {
        if (is_admin) {
            sendNewFontSizeRequest.mutate(newFontSize);
        }
    }

    function changeTokenButtonsVisibility() {
        if (is_admin) {
            tokenButtonsVisibilityRequest.mutate(HidTokenButtons);
        }
    }

    return (
        <div className="admin-panel">
            {is_admin && <>
                <button type="button" className={`button${HidTokenButtons ? '' : ' button--pressed'}`} onClick={changeTokenButtonsVisibility}>{HidTokenButtons ? 'Show' : 'Hide'}</button>
                {!HidTokenButtons && <button className="button" type="button" onClick={() => window.location.href = daLink}>DA<img src={daIconPath} alt="donation alerts icon" height={21} width={18}></img></button>}
                <button className="button" type="button" onClick={setupDA}>Setup<img src={daIconPath} alt="donation alerts icon" height={21} width={18}></img></button>
                {isSetupDA && (isListeningToDA ?
                    <button type="button" className="button button--pressed" onClick={stopDA}>Stop<img src={daIconPath} alt="donation alerts icon" height={21} width={18}></img></button>
                    :
                    <button type="button" className="button" onClick={startDA}>Start<img src={daIconPath} alt="donation alerts icon" height={21} width={18}></img></button>)
                }
                {!HidTokenButtons && <button className="button" type="button" onClick={() => window.location.href = adminGetTokens}>Twitch Token</button>}
                <button className="button" type="button" onClick={getTwitchMods}>Twitch Mods</button>
                {!is_live && <button className="button" type="button" onClick={startQueue}>Start queue</button>}
                {is_live && <button type="button" className="button button--pressed" onClick={stopQueue}>Stop queue</button>}
                <button className="button" type="button" onClick={addQueueSong}>Add song</button>
                <div>
                    <input className="admin-input" type="string" value={newFontSize} onChange={onFontSizeChange} />
                    <button className="button" type="button" onClick={sendNewFontSize}>Set font size of overlay</button>
                </div>
                <div>
                    <input className="admin-input" type="number" value={newMaxDisplay} onChange={onMaxDisplayChange} />
                    <button className="button" type="button" onClick={sendNewMaxDisplay}>Set max overlay display</button>
                </div>
                <div className="edit-info">
                    <textarea name="text-info" className="admin-input admin-textarea" onChange={onTextInfoAreaChange} value={infoText} />
                    <div className="edit-checkbox">
                        <input type="checkbox" className="show-info" id="show-info" name="show-info" checked={showInfo} onChange={onShowInfoChange} />
                        <label htmlFor="show-info">show info</label>
                    </div>
                    <button className="button" type="button" onClick={changeInfo}>Change info</button>
                </div>
                {<Alert class_name={`alert alert--admin${sliding ? ' alert--sliding' : ''}`} message={alertMessage} />}
            </>}
        </div>
    );
};
