import { Draggable } from '@hello-pangea/dnd';
import { AxiosResponse } from 'axios';
import React from 'react';
import { UseMutationResult } from 'react-query';
import { LikesState, QueueEntry } from '../pages/Queue';
import { LikeBlock } from './LikeBlock';
import { QueueItemInfo } from './QueueItemInfo';

interface QueueModElementProps {
    like_count: number;
    index: number;
    entry: QueueEntry;
    user_like: LikesState | undefined;
    delete_queue_entry_request: UseMutationResult<AxiosResponse<any, any>, unknown, {
        id: number;
        index: number;
    }, unknown>;
    queue_change_request: UseMutationResult<AxiosResponse<any, any>, unknown, { queueEntry: QueueEntry, index: number }, unknown>;
    queue_entry_change_event: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    queue_entry_text_area_change_event: (event: React.ChangeEvent<HTMLTextAreaElement>, index: number) => void;
    change_delete_intention: (index: number, text: 'Delete' | 'Sure?' | 'Error!', delete_intention: boolean) => void;
    change_mod_view: (index: number) => void;
    click_like_handler: (song_id: number, is_positive: number, index: number) => void;
}

export const QueueModElement: React.FC<QueueModElementProps> = ({
    like_count,
    index,
    entry,
    user_like,
    delete_queue_entry_request,
    queue_change_request,
    queue_entry_change_event,
    queue_entry_text_area_change_event,
    change_delete_intention,
    change_mod_view,
    click_like_handler
}) => {

    function deleteQueueEntry() {
        if (entry.delete_intention) {
            delete_queue_entry_request.mutate({ id: entry.id, index: index });
        } else {
            change_delete_intention(index, 'Sure?', true);
        }
    }

    function changeQueueEntry() {
        queue_change_request.mutate({ queueEntry: entry, index: index });
    }

    return (
        <Draggable key={entry.id} draggableId={entry.id.toString()} index={index}>
            {(provided) => {
                return (
                    <li className={`item item--mod item--${entry.style}`} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                        {entry.mod_view && <>
                            <p className="info__number">{index + 1}</p>
                            <div className="item__edit">
                                <input type="text" name="artist" placeholder="artist" className={`${entry.id.toString()} admin-input`} onChange={(event) => queue_entry_change_event(event, index)} value={entry.artist ? entry.artist : ''} />
                                <input type="text" name="song_name" placeholder="song name" className={`${entry.id.toString()} admin-input`} onChange={(event) => queue_entry_change_event(event, index)} value={entry.song_name ? entry.song_name : ''} />
                                <input type="text" name="donor_name" placeholder="donor name" className={`${entry.id.toString()} admin-input`} onChange={(event) => queue_entry_change_event(event, index)} value={entry.donor_name!} />
                                <input type="text" name="donate_amount" placeholder="amount" className={`${entry.id.toString()} admin-input`} onChange={(event) => queue_entry_change_event(event, index)} value={entry.donate_amount!} />
                                <input type="text" name="currency" placeholder="currency" className={`${entry.id.toString()} admin-input`} onChange={(event) => queue_entry_change_event(event, index)} value={entry.currency!} />
                                <input type="text" name="tag" placeholder="tag" className={`${entry.id.toString()} admin-input`} onChange={(event) => queue_entry_change_event(event, index)} value={entry.tag ? entry.tag : ''} />
                                <textarea name="donor_text" className={`${entry.id.toString()} admin-input admin-textarea`} onChange={(event) => queue_entry_text_area_change_event(event, index)} value={entry.donor_text!} />
                            </div>
                        </>}
                        {!entry.mod_view &&
                            <QueueItemInfo index={index}
                                artist={entry.artist}
                                song_name={entry.song_name}
                                currency={entry.currency}
                                donate_amount={entry.donate_amount}
                                donor_name={entry.donor_name}
                                current={entry.current}
                                played={entry.played}
                                key={entry.id}
                            />
                        }
                        <div className="item__buttons">
                            <button className="button" type="button" onClick={changeQueueEntry}>Apply</button>
                            <button className="button" type="button" onClick={deleteQueueEntry}>{entry.delete_button_text}</button>
                            <button className="button" type="button" onClick={() => change_mod_view(index)}>{entry.button_text}</button>
                        </div>
                        <div className="item__checkboxes">
                            <input type="checkbox" className={entry.id.toString()} name="played" checked={entry.played} onChange={(event) => queue_entry_change_event(event, index)} />
                            <label htmlFor="played">played</label>
                            <input type="checkbox" className={entry.id.toString()} name="will_add" checked={entry.will_add} onChange={(event) => queue_entry_change_event(event, index)} />
                            <label htmlFor="will_add">will add</label>
                            <input type="checkbox" className={entry.id.toString()} name="visible" checked={entry.visible} onChange={(event) => queue_entry_change_event(event, index)} />
                            <label htmlFor="visible">visible</label>
                            <input type="checkbox" className={entry.id.toString()} name="current" checked={entry.current} onChange={(event) => queue_entry_change_event(event, index)} />
                            <label htmlFor="current">current</label>
                        </div>
                        <LikeBlock like_state={user_like}
                            song_id={entry.id}
                            like_count={like_count}
                            clickLikeHandler={click_like_handler}
                            index={index}
                        />
                    </li>);
            }
            }
        </Draggable>
    );
};
