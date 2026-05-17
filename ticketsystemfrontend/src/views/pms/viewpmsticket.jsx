import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Card, Button, Modal, Alert, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';
import FeatherIcon from 'feather-icons-react';
import Spinner from 'react-bootstrap/Spinner';
import BTN from 'layouts/ReactBits/BTN';
import { supabase } from '../../createClient';

export default function ViewPmsTicket() {
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [ticketForData, setTicketForData] = useState({});
    const [currentUserData, setCurrentUserData] = useState({});

    const [hdUser, setHDUser] = useState({});
    const [tier, setTier] = useState('')
    const pmsticket_id = new URLSearchParams(window.location.search).get('id');

    const [allnotes, setAllNotes] = useState([]);
    const [notesofhduser, setnoteofhduser] = useState('')

    const [showCloseReasonModal, setShowCloseReasonModal] = useState(false);
    const [close, setClose] = useState(false);
    const [closureReason, setClosureReason] = useState('');

    const [showCloseReviewModal, setShowCloseReviewModal] = useState(false);
    const [userfeedback, setUserFeedback] = useState('');
    const [value, setValue] = useState(3);

    const [error, setError] = useState('');
    const [successful, setSuccessful] = useState('');

    const [collaboratorState, setCollaboratorState] = useState(false);
    const [allHDUser, setAllHDUser] = useState([]);

    const [loading, setLoading] = useState(false);
    const [resolveState, setResolveState] = useState(false);

    // New state for signature upload
    const [signatureFile, setSignatureFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const fileInputRef = useRef(null);

    const thumbLeft = `${10 + (value - 1) * 20}%`;

    // Get all user
    useEffect(() => {
        const fetch = async () => {
            try {
                // axios.get(`${config.baseApi}/authentication/get-all-users`)
                await supabase.from('users_master').select('*')
                    .then((res) => {

                        const allHD = res.data.filter(hd => hd.emp_tier === 'helpdesk');
                        setAllHDUser(allHD);

                    })
                    .catch((err) => {
                        console.error("Error fetching users:", err);
                    });
            } catch (err) {
                console.log('Unable to get all users: ', err)
            }
        }
        fetch()
    }, [])

    //Alert timeout effect 3s
    useEffect(() => {
        if (error || successful) {
            const timer = setTimeout(() => {
                setError('');
                setSuccessful('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successful]);

    // Fetch all notes for the ticket
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // const getTicket = await axios.get(`${config.baseApi}/pmsticket/get-all-notes/${pmsticket_id}`);
                const getTicket = await supabase.from('pmsnotes_master')
                    .select('*')
                    .eq('pmsticket_id', pmsticket_id)
                    .order('created_at', { ascending: true })
                    .order('created_by', { ascending: true })
                    .order('note', { ascending: true });




                const usernames = getTicket.data.map(note => note.created_by);

                // const response = await axios.get(`${config.baseApi}/authentication/get-all-notes-usernames`, {
                //     params: { user_name: JSON.stringify(usernames) }
                // });
                const response = await supabase.from('users_master').select('*').eq('user_name', JSON.stringify(usernames))
                setAllNotes(response.data);

                const userMap = {}
                response.data.forEach(user => {
                    userMap[user.user_name] = `${user.emp_FirstName} ` + ' ' + `${user.emp_LastName}`;
                });
                setnoteofhduser(userMap)

            } catch (err) {
                console.log('Unable to fetch data: ', err)
            }
        }
        fetchNotes();
    }, [])

    // Fetch ticket data by ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                // const fetchticket = await axios.get(`${config.baseApi}/pmsticket/pmsticket-by-id`, {
                //     params: { id: pmsticket_id }
                // });

                const fetchticket = await supabase.from('pmsticket_master').select('*').eq('pmsticket_id', pmsticket_id).single();
                const ticket = Array.isArray(fetchticket.data) ? fetchticket.data[0] : fetchticket.data;
                setFormData(ticket);

                setOriginalData(ticket);

            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [pmsticket_id]);

    // Check if ticket status is closed
    useEffect(() => {
        if (formData.pms_status === 'closed') {
            setClose(false)
        }
        else if (formData.pms_status === 'resolved') {
            setResolveState(true)
            setClose(true)
        }
        else {
            setClose(true)
        }

        if (formData.is_reviewed === true && formData.pms_status === 'closed') {
            setShowCloseReviewModal(false)
            setClose(false)
        }


        if (hasChanges === false && formData.pms_status === 'closed' && (formData.is_reviewed === false || formData.is_reviewed === null)) {
            setShowCloseReviewModal(true)
            setClose(false)
        } else {
            setShowCloseReviewModal(false)
        }


    }, [formData.pms_status])

    // Fetch current user data from local storage
    useEffect(() => {
        const empInfo = JSON.parse(localStorage.getItem('user'));
        setCurrentUserData(empInfo);
    }, []);

    // Fetch created by user data
    useEffect(() => {
        if (formData.pmsticket_for) {
            const fetchCreatedby = async () => {
                try {
                    // const response = await axios.get(`${config.baseApi}/authentication/get-by-username`, {
                    //     params: { user_name: formData.pmsticket_for }
                    // });

                    const response = await supabase.from('users_master').select('*').eq('user_name', formData.pmsticket_for).single();
                    setTicketForData(response.data);

                } catch (err) {
                    console.log(err);
                }
            };
            fetchCreatedby();
        }

        if (formData.assigned_to) {
            const fetchHDUser = async () => {
                try {
                    // const response = await axios.get(`${config.baseApi}/authentication/get-by-username`, {
                    //     params: { user_name: formData.assigned_to }
                    // });

                    const response = await supabase.from('users_master').select('*').eq('user_name', formData.assigned_to).single();
                    setHDUser(response.data);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchHDUser();
        }
    }, [formData.pmsticket_for]);

    //Lock Function
    useEffect(() => {
        const interval = setInterval(() => {
            const getUpdated = async () => {
                try {
                    // const response = await axios.get(`${config.baseApi}/pmsticket/pmsticket-by-id`, {
                    //     params: { id: pmsticket_id }
                    // });

                    const response = await supabase.from('pmsticket_master').select('*').eq('pmsticket_id', pmsticket_id).single();
                    const ticketdata = response.data.data || response.data;

                    if (ticketdata.is_locked === '1') {
                        setLoading(false)
                        setError(`${ticketdata.locked_by} is currently working on this ticket`)
                        setClose(false)
                        setShowCloseReasonModal(false)
                        setShowCloseReviewModal(false)
                    }
                    else if ((ticketdata.is_locked === '0' || ticketdata.is_locked === null) && ticketdata.is_reviewed === true && ticketdata.pms_status === 'closed') {
                        setClose(false)
                    }
                    else if ((ticketdata.is_locked === '0' || ticketdata.is_locked === null) && ticketdata.pms_status !== 'closed') {
                        setClose(true)
                    } else {
                        console.log("is_locked is missing or not boolean:", ticketdata.is_locked);
                    }

                } catch (err) {
                    console.error("Error fetching ticket:", err);
                }
            };

            getUpdated();
        }, 5000);

        return () => clearInterval(interval);
    }, [pmsticket_id, currentUserData]);

    // Handle Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev, [name]: value };
            const fieldsToCheck = ['tag_id', 'pms_status', 'description',];
            const changed = fieldsToCheck.some(field => updatedForm[field] !== originalData[field]);
            setHasChanges(changed);
            return updatedForm;
        });
    };

    // Handle signature file selection - RESTRICTED TO JPG/PNG ONLY
    const handleSignatureFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Define allowed file types (JPG and PNG only)
            const allowedTypes = ['image/jpeg', 'image/png'];
            const allowedExtensions = ['jpg', 'jpeg', 'png'];

            // Get file extension
            const extension = file.name.split('.').pop().toLowerCase();

            // Check MIME type and file extension
            if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(extension)) {
                setError('Only JPG and PNG files are allowed!');
                e.target.value = ''; // Clear the input
                setSignatureFile(null);
                setSignaturePreview(null);
                return;
            }

            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                e.target.value = ''; // Clear the input
                setSignatureFile(null);
                setSignaturePreview(null);
                return;
            }

            setSignatureFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    //Check fields
    const HandleCheckerFields = async () => {
        try {
            // const response = await axios.get(`${config.baseApi}/pmsticket/pmsticket-by-id`, {
            //     params: { id: pmsticket_id }
            // });
            const response = await supabase.from('pmsticket_master').select('*').eq('pmsticket_id', pmsticket_id).single();
            const ticketdata = response.data.data || response.data;

            if (formData.pms_status === 'closed' && ticketdata.is_locked === '1') {
                setShowCloseReasonModal(false);
            } else if (formData.pms_status === 'closed') {
                setShowCloseReasonModal(true);
            }
            else {
                await handleSave();
            }
        } catch (err) {
            console.log('Unable to get ticket details: ', err)
        }

    }

    // Function to rename file with username-signature pattern
    const renameSignatureFile = (file, userName) => {
        // Get file extension
        const fileExtension = file.name.split('.').pop();
        const empInfo = JSON.parse(localStorage.getItem('user'));

        // Create new filename: username-signature.extension
        const newFileName = `${userName}-${empInfo.user_id}.${fileExtension}`;

        // Create a new File object with the new name
        const renamedFile = new File([file], newFileName, {
            type: file.type,
            lastModified: file.lastModified,
        });

        console.log('File renamed from:', file.name, 'to:', newFileName);

        return renamedFile;
    };


    // Reason why Close ticket function - Now with signature logging
    // const handleConfirmClosure = async (e) => {
    //     e.preventDefault();
    //     const empInfo = JSON.parse(localStorage.getItem('user'));
    //     if (!closureReason.trim()) return;

    //     try {
    //         // Check if signature file exists
    //         if (!signatureFile) {
    //             setError('Please upload your signature');
    //             return;
    //         }

    //         // Rename the file with username pattern
    //         const renamedFile = renameSignatureFile(signatureFile, empInfo.user_name);

    //         // Place a note
    //         setLoading(true);
    //         const finalnote = 'User Closed the ticket with notes: \n' + closureReason;

    //         const dataToSend = new FormData();
    //         dataToSend.append('notes', finalnote);
    //         dataToSend.append('current_user', empInfo.user_name);
    //         dataToSend.append('pmsticket_id', pmsticket_id);
    //         dataToSend.append('is_pms', 'true'); // Send as string, not boolean

    //         // IMPORTANT: Append the actual file, not just the filename!
    //         dataToSend.append('signature', renamedFile); // Send the file object

    //         // Log FormData contents for debugging
    //         console.log('Sending FormData:');
    //         for (let pair of dataToSend.entries()) {
    //             console.log(pair[0] + ': ' + (pair[0] === 'signature' ? pair[1].name : pair[1]));
    //         }

    //         // await axios.post(`${config.baseApi}/pmsticket/note-post-signature`, dataToSend, {
    //         //     headers: {
    //         //         'Content-Type': 'multipart/form-data'
    //         //     }
    //         // });

    //         await supabase.from('pmsnotes_master').insert({
    //             note: finalnote,
    //             created_by: empInfo.user_name,
    //             pmsticket_id: pmsticket_id,
    //             is_pms: true,
    //             signature: 'PUT THE FILE PATH HERE'
    //         });

    //         // await knex('pmsticket_master').where({ pmsticket_id }).update({
    //         //     signature: req.file.path // Update the ticket with the signature path
    //         // })

    //         await supabase.from('pmsticket_master').update({
    //             signature: 'PUT THE FILE PATH HERE'
    //         }).eq('pmsticket_id', pmsticket_id);

    //         // await knex('pmsticket_logs').insert({
    //         //     pmsticket_id: pmsticket_id,
    //         //     tag_id: '',
    //         //     created_by: current_user,
    //         //     created_at: currentTimestamp,
    //         //     changes_made: `${current_user} placed a note "${notes}"`
    //         // });

    //         await supabase.from('pmsticket_logs').insert({
    //             pmsticket_id: pmsticket_id,
    //             tag_id: '',
    //             created_by: empInfo.user_name,
    //             created_at: new Date(),
    //             changes_made: `${empInfo.user_name} placed a note "${finalnote}"`
    //         })


    //         // Send app notification
    //         // await axios.post(`${config.baseApi}/pmsticket/notified-true`, {
    //         //     pmsticket_id: pmsticket_id,
    //         //     user_id: empInfo.user_id
    //         // });

    //         await supabase.from('pmsticket_master').update({
    //             is_notifiedhd: true
    //         }).eq('pmsticket_id', pmsticket_id)

    //         setShowCloseReasonModal(false);
    //         setClosureReason('');
    //         setSignatureFile(null);
    //         setSignaturePreview(null);
    //         setClose(false);

    //         await handleSave();

    //         setLoading(false);
    //         setSuccessful('Ticket closed successfully.');

    //     } catch (err) {
    //         console.log('Error details:', err.response?.data || err);
    //         setLoading(false);
    //         setError('Failed to close ticket. Please try again.');
    //         setShowCloseReasonModal(false);
    //         setClosureReason('');
    //     }
    // };


    // Reason why Close ticket function - Now with signature logging
    // Reason why Close ticket function - With signature upload to Supabase
    const handleConfirmClosure = async (e) => {
        e.preventDefault();
        const empInfo = JSON.parse(localStorage.getItem('user'));
        if (!closureReason.trim()) return;

        try {
            // Check if signature file exists
            if (!signatureFile) {
                setError('Please upload your signature');
                return;
            }

            setLoading(true);

            // Rename the file with username pattern
            const renamedFile = renameSignatureFile(signatureFile, empInfo.user_name);

            // Create a unique file path for the signature
            const timestamp = Date.now();
            const fileExtension = renamedFile.name.split('.').pop();
            const filePath = `e_signature/${pmsticket_id}/${empInfo.user_name}_${timestamp}.${fileExtension}`;

            console.log('Uploading signature to:', filePath);

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('e_signature') // Use your exact bucket name from the image (uppercase)
                .upload(filePath, renamedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error(`Failed to upload signature: ${uploadError.message}`);
            }

            console.log('Upload successful:', uploadData);

            // Get the public URL of the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from('e_signature')
                .getPublicUrl(filePath);

            const signatureUrl = publicUrlData.publicUrl;
            console.log('Signature URL:', signatureUrl);

            // Prepare note data
            const finalnote = `User closed the ticket with reason: ${closureReason}`;
            const currentTimestamp = new Date().toISOString();
            const ticketId = parseInt(pmsticket_id);

            // 1. Insert note with signature
            const noteData = {
                note: finalnote,
                created_by: empInfo.user_name,
                pmsticket_id: ticketId,
                is_pms: true,
                signature: signatureUrl,
                created_at: currentTimestamp
            };

            console.log('Inserting note:', noteData);

            const { error: noteError } = await supabase
                .from('pmsnotes_master')
                .insert(noteData);

            if (noteError) {
                console.error('Note insert error:', noteError);
                throw new Error(`Failed to insert note: ${noteError.message} - ${JSON.stringify(noteError.details)}`);
            }

            // 2. Update the ticket with signature
            const { error: ticketError } = await supabase
                .from('pmsticket_master')
                .update({
                    signature: signatureUrl,
                    pms_status: 'closed',
                    updated_by: empInfo.user_name,
                    updated_at: currentTimestamp,
                    is_notifiedhd: true  // Update notification flag directly
                })
                .eq('pmsticket_id', ticketId);

            if (ticketError) {
                console.error('Ticket update error:', ticketError);
                throw new Error(`Failed to update ticket: ${ticketError.message}`);
            }

            // 3. Insert into ticket logs (optional - skip if table doesn't exist)
            try {
                const { error: logError } = await supabase
                    .from('pmsticket_logs')
                    .insert({
                        pmsticket_id: ticketId,
                        tag_id: formData.tag_id || '',
                        created_by: empInfo.user_name,
                        created_at: currentTimestamp,
                        changes_made: `${empInfo.user_name} closed the ticket with signature verification. Reason: ${closureReason}`
                    });

                if (logError) {
                    console.warn('Log insert warning (non-critical):', logError.message);
                    // Don't throw, this is not critical
                }
            } catch (logErr) {
                console.warn('Log table may not exist:', logErr);
            }

            console.log('Ticket closed successfully!');

            // Clear modal and state
            setShowCloseReasonModal(false);
            setClosureReason('');
            setSignatureFile(null);
            setSignaturePreview(null);

            // Update local state
            setFormData(prev => ({ ...prev, pms_status: 'closed', signature: signatureUrl }));
            setOriginalData(prev => ({ ...prev, pms_status: 'closed', signature: signatureUrl }));
            setHasChanges(false);

            setLoading(false);
            setSuccessful('Ticket closed successfully with digital signature verification.');

            // // Refresh the page after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            console.error('Error closing ticket:', err);
            setLoading(false);
            setError(err.message || 'Failed to close ticket. Please try again.');
            // Don't close the modal on error so user can try again
        }
    };




    //Review function
    const handleReview = async (value, userfeedback) => {

        const empInfo = JSON.parse(localStorage.getItem("user"));
        console.log("was triggered. ", `Review ${userfeedback} HelpDesk: ${hdUser.user_id} Reviewed by: ${empInfo.user_name}`);

        // validate input first
        if (!userfeedback) {
            setError("Feedback must not be empty!");
            return;
        }

        try {
            setLoading(true);
            // get all feedback first
            // const res = await axios.get(`${config.baseApi}/pmsticket/get-all-feedback`);
            const res = await supabase.from('pmsreview_master').select('*');
            const feedData = res.data || [];
            const feedTicket = feedData.filter((f) => String(f.pmsticket_id) === String(pmsticket_id));
            if (feedTicket.length > 0) {
                // delete first, then insert inside .then
                // await axios
                //     .post(`${config.baseApi}/pmsticket/feedback-delete-by-id`, {
                //         pmsticket_id: pmsticket_id,
                //         review: userfeedback,
                //         user_id: hdUser.user_id,
                //         created_by: empInfo.user_name,
                //         score: value,
                //     })

                await supabase.from('pmsreview_master').delete().eq('pmsticket_id', pmsticket_id);
                await supabase.from('pmsreview_master').insert({
                    review: userfeedback,
                    user_id: hdUser.user_id,
                    created_at: new Date(),
                    created_by: empInfo.user_name,
                    pmsticket_id: pmsticket_id,
                    score: value
                })

                await supabase.from('pmsticket_master').update({
                    is_reviewed: true
                }).eq('pmsticket_id', pmsticket_id)

                setShowCloseReviewModal(false);
                setUserFeedback("");

                window.location.reload()

            } else {
                // if no feedback existed, insert directly
                // await axios.post(`${config.baseApi}/pmsticket/feedback`, {
                //     review: userfeedback,
                //     user_id: hdUser.user_id,
                //     created_by: empInfo.user_name,
                //     pmsticket_id: formData.pmsticket_id,
                //     score: value,
                // });
                await supabase.from('pmsreview_master').insert({
                    review: userfeedback,
                    user_id: hdUser.user_id,
                    created_by: empInfo.user_name,
                    created_at: new Date(),
                    pmsticket_id: formData.pmsticket_id,
                    score: value
                })

                await supabase.from('pmsticket_master').update({
                    is_reviewed: true
                }).eq('pmsticket_id', pmsticket_id)

                setShowCloseReviewModal(false);
                setUserFeedback("");

                window.location.reload()
            }

        } catch (err) {
            console.log("Error while submitting review: ", err);
        }
    };

    // //Save updated fields
    const handleSave = async () => {
        try {
            const empInfo = JSON.parse(localStorage.getItem('user'));
            // const fetchticket = await axios.get(`${config.baseApi}/pmsticket/pmsticket-by-id`, {
            //     params: { id: pmsticket_id }
            // });
            const fetchticket = await supabase.from('pmsticket_master').select('*').eq('pmsticket_id', pmsticket_id).single();
            const ticket = Array.isArray(fetchticket.data) ? fetchticket.data[0] : fetchticket.data;

            //Check if someone is working on this ticket
            if (ticket.is_locked === '0' || ticket.locked_by === empInfo.user_name || ticket.locked_by === null) {


                //check any changes to save logs
                const changedFields = [];
                const fieldsToCheck = ['tag_id', 'pms_status', 'description'];
                fieldsToCheck.forEach(field => {
                    const original = originalData[field];
                    const current = formData[field];
                    if ((original ?? '') !== (current ?? '')) {
                        changedFields.push(` ${currentUserData.user_name} Changed '${field}' from '${original}' to '${current}'`)
                    }
                });
                const changesMade = changedFields.length > 0 ? changedFields.join('; ') : '';


                //save note if user re-opened the ticket
                if (formData.pms_status === 're-opened') {
                    console.log('!!!!!!!!!!!!!!!!')
                    // await axios.post(`${config.baseApi}/pmsticket/note-post`, {
                    //     notes: `${currentUserData.user_name} re opened the ticket.`,
                    //     current_user: currentUserData.user_name,
                    //     pmsticket_id: pmsticket_id
                    // });

                    await supabase.from('pmsnotes_master').insert({
                        note: `${currentUserData.user_name} re opened the ticket.`,
                        created_by: currentUserData.user_name,
                        created_at: new Date(),
                        pmsticket_id: pmsticket_id,
                    });

                    await supabase.from('pmsticket_logs').insert({
                        pmsticket_id: pmsticket_id,
                        tag_id: '',
                        created_by: currentUserData.user_name,
                        created_at: new Date(),
                        changes_made: `${currentUserData.user_name} placed a note "${currentUserData.user_name} re opened the ticket."`
                    });

                }

                // Send notification to HD
                setLoading(true)
                // await axios.post(`${config.baseApi}/pmsticket/notified-true`, {
                //     pmsticket_id: pmsticket_id,
                //     user_id: currentUserData.user_id
                // })

                await supabase.from('pmsticket_master').update({
                    created_by: currentUserData.user_name,
                    is_notifiedhd: true
                }).eq('pmsticket_id', pmsticket_id)


                setLoading(true)
                // await axios.post(`${config.baseApi}/pmsticket/update-pmsticket`, {
                //     pmsticket_id: formData.pmsticket_id,
                //     tag_id: formData.tag_id,
                //     pms_status: formData.pms_status,
                //     description: formData.description,
                //     updated_by: currentUserData.user_id,
                //     changes_made: changesMade,
                //     assigned_to_UserId: hdUser.user_id,
                //     assigned_to: formData.assigned_to,
                // });


                if (formData.pms_status === 'open') {
                    // await knex('pmsticket_master').where('pmsticket_id', pmsticket_id).update({
                    //     assigned_to: '',
                    // });
                    await supabase.from('pmsticket_master').update({
                        assigned_to: '',
                    }).eq('pmsticket_id', pmsticket_id)
                }
                else if (formData.assigned_to && formData.assigned_to.trim() !== '') {
                    // If status is not open and assigned_to exists, update normally
                    // await knex('pmsticket_master').where('pmsticket_id', pmsticket_id).update({
                    //     assigned_to,

                    //     updated_by: updateByInfo.user_name,
                    //     updated_at: currentTimestamp
                    // });
                    await supabase.from('pmsticket_master').update({
                        assigned_to: formData.assigned_to,

                        updated_by: empInfo.user_name,
                        updated_at: new Date()
                    }).eq('pmsticket_id', pmsticket_id)
                    console.log(`Ticket ${pmsticket_id} assigned to ${assigned_to}`);
                }

                // await knex('pmsticket_master').where('pmsticket_id', pmsticket_id).update({
                //     pms_status: formData.pms_status,
                //     tag_id: formData.tag_id,
                //     description: formData.description,
                //     assigned_location: formData.assigned_location,
                //     pmsticket_for: formData.pmsticket_for,

                //     updated_at: new Date(),
                //     updated_by: empInfo.user_name,
                // });

                await supabase.from('pmsticket_master').update({
                    pms_status: formData.pms_status,
                    tag_id: formData.tag_id,
                    description: formData.description,
                    assigned_location: formData.assigned_location,
                    pmsticket_for: formData.pmsticket_for,

                    updated_at: new Date(),
                    updated_by: empInfo.user_name,
                }).eq('pmsticket_id', pmsticket_id)


                // Insert into ticket logs
                // await knex('pmsticket_logs').insert({
                //     pmsticket_id,
                //     tag_id,
                //     created_by: updateByInfo.user_name,
                //     created_at: currentTimestamp,
                //     changes_made
                // });

                await supabase.from('pmsticket_logs').insert({
                    pmsticket_id: pmsticket_id,
                    tag_id: formData.tag_id,
                    created_by: empInfo.user_name,
                    created_at: new Date(),
                    changes_made: changesMade
                })



                console.log('!!!!!!!!!!!!!!!!')

                if (formData.pms_status === 'closed') {
                    setLoading(false)
                    setSuccessful('Ticket updated successfully.');
                    setOriginalData(formData);
                    setHasChanges(false);
                } else {
                    setLoading(false)
                    setSuccessful('Ticket updated successfully.');
                    setOriginalData(formData);
                    setHasChanges(false);
                }
            } else if (ticket.is_locked === '1' || ticket.locked_by !== empInfo.user_name) {
                setLoading(false)
                setError(`${ticket.updating_by} is currently working on this ticket`);
                return;
            }
            window.location.reload();

        } catch (err) {
            console.error("Error updating ticket:", err);
            setLoading(false)
            setError('Failed to update ticket.');
        }
    };

    return (
        <Container fluid className="pt-100 pb-4" style={{ background: 'linear-gradient(to bottom, #ffe798, #b8860b)', minHeight: '100vh', paddingTop: '100px' }}>
            {/* ALERT Component */}
            {error && (
                <div
                    className="position-fixed start-50 l translate-middle-x"
                    style={{ top: '100px', zIndex: 9999, minWidth: '300px' }}
                >
                    <Alert variant="danger" onClose={() => setError('')} dismissible>
                        {error}
                    </Alert>
                </div>
            )}
            {successful && (
                <div
                    className="position-fixed start-50 l translate-middle-x"
                    style={{ top: '100px', zIndex: 9999, minWidth: '300px' }}
                >
                    <Alert variant="success" onClose={() => setSuccessful('')} dismissible>
                        {successful}
                    </Alert>
                </div>
            )}

            <Container className="bg-white p-4 rounded-3 shadow-sm">
                <Row>
                    <Col lg={8}>
                        {/* Buttons */}
                        <Row className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="fw-bold text-dark mb-0">PMS Ticket Details</h3>
                                <div className="d-flex gap-2">
                                    {/* Save Chnges */}
                                    {hasChanges && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            style={{ width: '200px', minHeight: '40px' }}

                                            onClick={HandleCheckerFields}
                                        >
                                            Save Changes
                                        </Button>
                                        // <BTN size="sm" label={'Save Changes'}>

                                        // </BTN>
                                    )}

                                </div>
                            </div>
                        </Row>

                        <h6 className="text-muted fw-semibold mb-2">Dates</h6>
                        <Row>
                            {['created_at', 'resolved_at'].map((field, index) => (
                                <Form.Group as={Col} md={6} className="mb-2" key={index}>
                                    <Form.Label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
                                    <Form.Control name={field} value={formData[field] ? new Date(formData[field]).toLocaleString() : '-'} disabled />
                                </Form.Group>
                            ))}
                        </Row>

                        {/* DETAILS */}
                        <h6 className="text-muted fw-semibold mt-4 mb-2">Details</h6>
                        <Row>
                            <Col md={6} className="mb-2">
                                <Form.Label>Assigned To</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FeatherIcon icon="user" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="assigned_to"
                                        value={
                                            hdUser?.emp_FirstName && hdUser?.emp_LastName
                                                ? `${hdUser.emp_FirstName} ${hdUser.emp_LastName}`
                                                : '-'
                                        }
                                        disabled
                                    />
                                </InputGroup>
                            </Col>
                        </Row>


                        <h6 className="text-muted fw-semibold mt-4 mb-2">Request Info</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket ID</Form.Label>
                                <Form.Control name="pmsticket_id" value={formData.pmsticket_id ?? ''} disabled />
                            </Form.Group>

                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="pms_status" value={formData.pms_status ?? ''} onChange={handleChange} disabled={!close} required>
                                    <option value="open" hidden>Open</option>
                                    <option value="closed">Close</option>
                                    <option value="re-opened">Re open</option>

                                    <option value="assigned" hidden>Assigned</option>
                                    <option value="in-progress" hidden>In Progress</option>
                                    {/* <option value="escalate" hidden>Escalated</option> */}
                                    <option value="resolved" hidden>Resolve</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group as={Col} md={6} className="mb-3">
                                <Form.Label>Tag ID</Form.Label>
                                <Form.Control name="tag_id" value={formData.tag_id ?? ''} onChange={handleChange} disabled={!close} />
                            </Form.Group>

                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Description</h6>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={7}
                                name="description"
                                value={formData.description ?? 'No Description Provided'}
                                onChange={handleChange}
                                disabled={!close}
                            />
                        </Form.Group>
                    </Col>

                    <Col lg={4}>
                        <h6 className="text-muted fw-semibold mb-2">Helpdesk Notes</h6>
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                <Form.Group>
                                    <div
                                        style={{
                                            maxHeight: '600px',
                                            overflowY: 'auto',
                                            paddingRight: '5px',
                                        }}
                                    >
                                        {allnotes && allnotes.length > 0 ? (
                                            [...allnotes]
                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                .map((note, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-3 p-3 rounded-3 shadow-sm bg-body-tertiary border border-light-subtle"
                                                    >
                                                        <div
                                                            className="text-dark"
                                                            style={{
                                                                fontSize: '0.95rem',
                                                                whiteSpace: 'pre-wrap',
                                                            }}
                                                        >
                                                            {note.note}
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                                            <small className="text-muted fst-italic">
                                                                {notesofhduser[note.created_by] || note.created_by || 'Unknown'}
                                                            </small>
                                                            <small className="text-muted">
                                                                {note.created_at
                                                                    ? new Date(
                                                                        note.created_at
                                                                    ).toLocaleString()
                                                                    : ''}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-muted fst-italic">
                                                No notes available.
                                            </div>
                                        )}
                                    </div>

                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* CLOSE TICKET MODAL WITH SIGNATURE UPLOAD */}
                <Modal show={showCloseReasonModal} onHide={() => {
                    setShowCloseReasonModal(false);
                    setSignatureFile(null);
                    setSignaturePreview(null);
                }} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Reason for Closing Ticket</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="closureReason">
                            <Form.Label>Please provide a reason:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={closureReason}
                                onChange={(e) => setClosureReason(e.target.value)}
                                placeholder="Enter reason for closing the ticket"
                            />
                        </Form.Group>

                        {/* Signature Upload Section */}
                        <Form.Group style={{
                            marginTop: '15px',
                            padding: '15px',
                            border: '1px dashed #dee2e6',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa'
                        }}>
                            <Form.Label className="fw-bold">E-Signature</Form.Label>

                            {/* Signature preview if available */}
                            {signaturePreview && (
                                <div className="mb-3 text-center">
                                    <img
                                        src={signaturePreview}
                                        alt="Signature preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '150px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '4px',
                                            padding: '5px'
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleSignatureFileChange}
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={() => fileInputRef.current.click()}>
                                    <FeatherIcon icon="upload" style={{ marginRight: '8px' }} />
                                    Select Signature
                                </Button>
                            </div>

                            {signatureFile && (
                                <div className="mt-2 small text-muted">
                                    Selected: {signatureFile.name}
                                </div>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowCloseReasonModal(false);
                            setSignatureFile(null);
                            setSignaturePreview(null);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmClosure}
                            disabled={closureReason.trim() === ''}
                        >
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Resolve MOdal */}
                <Modal show={resolveState} onHide={() => setResolveState(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Ticket was marked Resolve</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="closureReason">

                            <div style={{ marginBottom: '5px', color: '#6c757d', fontSize: '0.9rem' }}>
                                You may now change the status to <b>Close</b> since the ticket has been resolved.
                                However, if the issue still persists, you may change the status to <b>Re-open</b> for further action.</div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setResolveState(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setResolveState(false)}

                        >
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Review Ticket with Scale + Feedback */}
                <Modal show={showCloseReviewModal} onHide={() => setShowCloseReviewModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Leave a Feedback (Required)</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Feedback Textarea */}
                        <Form.Group controlId="userfeedback" className="mb-3">
                            <Form.Label>How was our service?</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={userfeedback}
                                onChange={(e) => setUserFeedback(e.target.value)}
                                placeholder="Your feedback will help us improve our service"
                            />
                        </Form.Group>

                        {/* SCALE SLIDER */}
                        <Container fluid className="text-center mt-3">
                            <h5>SCALE</h5>
                            <Row className="justify-content-center">
                                <Col xs={12} sm={10} md={8}>
                                    <div style={{ position: "relative", width: "100%" }}>
                                        {/* colored bar */}
                                        <div
                                            style={{
                                                height: 12,
                                                borderRadius: 6,
                                                display: "flex",
                                                overflow: "hidden",
                                                width: "100%",
                                            }}
                                        >
                                            <div style={{ flex: 1, background: "#e74c3c" }} />
                                            <div style={{ flex: 1, background: "#e67e22" }} />
                                            <div style={{ flex: 1, background: "#f1c40f" }} />
                                            <div style={{ flex: 1, background: "#2ecc71" }} />
                                            <div style={{ flex: 1, background: "#27ae60" }} />
                                        </div>

                                        {/* custom thumb */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: thumbLeft,
                                                transform: "translate(-50%, -50%)",
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                background: "#333",
                                                boxShadow: "0 0 0 3px rgba(0,0,0,0.08)",
                                                zIndex: 2,
                                                pointerEvents: "none",
                                            }}
                                        />

                                        {/* invisible range */}
                                        <Form.Range
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={value}
                                            onChange={(e) => setValue(Number(e.target.value))}
                                            style={{
                                                position: "absolute",
                                                top: -12,
                                                left: 0,
                                                right: 0,
                                                width: "100%",
                                                height: 36,
                                                opacity: 0,
                                                cursor: "pointer",
                                                zIndex: 3,
                                            }}
                                        />
                                    </div>

                                    {/* Numbers aligned */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(5, 1fr)",
                                            marginTop: 8,
                                            fontSize: "clamp(0.8rem, 2vw, 1rem)",
                                        }}
                                    >
                                        {["1", "2", "3", "4", "5"].map((n) => (
                                            <div key={n} style={{ textAlign: "center" }}>
                                                {n}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Labels aligned */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(5, 1fr)",
                                            marginTop: 4,
                                            fontSize: "clamp(0.55rem, 1.2vw, 0.75rem)", // smaller min size for phones

                                            wordBreak: "break-word", // break words if needed on very small screens
                                        }}
                                    >
                                        <div style={{ textAlign: "center", color: "#e74c3c" }}>Very Dissatisfied</div>
                                        <div style={{ textAlign: "center", color: "#e67e22" }}>Dissatisfied</div>
                                        <div style={{ textAlign: "center", color: "#f1c40f" }}>Neutral</div>
                                        <div style={{ textAlign: "center", color: "#2ecc71" }}>Satisfied</div>
                                        <div style={{ textAlign: "center", color: "#27ae60" }}>Very Satisfied</div>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCloseReviewModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => handleReview(value, userfeedback)}
                            disabled={userfeedback.trim() === ""}
                        >
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>

            {/* Loading Component */}
            {loading && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.5)", // black transparent bg
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <Spinner animation="border" variant="light" />
                </div>

            )}

        </Container>
    );
}