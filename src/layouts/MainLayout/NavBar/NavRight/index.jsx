import { Link } from 'react-router-dom';

// react-bootstrap
import { ListGroup, Dropdown, Form, Badge } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import config from 'config';
import { supabase } from '../../../../createClient';

export default function NavRight() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [userData, setUserData] = useState([]);
  const [toFilter, setToFilter] = useState('');

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifContent, setNotifContent] = useState([]);

  const [topmsFilter, setTopmsFilter] = useState('');
  const [pmsnotificationCount, setPMSNotificationCount] = useState(0);
  const [pmsnotifContent, setPMSNotifContent] = useState([]);

  const [finale, setFinale] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem('user'));
    setUserData(empInfo);
    setPosition(empInfo.emp_position);
    if (empInfo?.emp_FirstName) {
      const FirstName =
        empInfo.emp_FirstName.charAt(0).toUpperCase() +
        empInfo.emp_FirstName.slice(1).toLowerCase();
      const LastName =
        empInfo.emp_LastName.charAt(0).toUpperCase() +
        empInfo.emp_LastName.slice(1).toLowerCase();
      setName(FirstName + ' ' + LastName);
    }
  }, []);

  useEffect(() => {
    if (!userData || !userData.emp_tier) return;

    if (userData.emp_tier === 'helpdesk') {
      setToFilter('assigned_to');
      setTopmsFilter('assigned_to');
    } else if (userData.emp_tier === 'user') {
      setToFilter('ticket_for');
      setTopmsFilter('pmsticket_for');
    }
  }, [userData]);

  useEffect(() => {
    if (!toFilter || !userData.user_name) return;
    fetchNotifications(userData.user_name);
  }, [toFilter, userData]);

  const fetchNotifications = async (user_name) => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      // ✅ Correct Supabase query syntax (no fetch() wrapper)
      const { data, error } = await supabase
        .from('ticket_master')
        .select('*');

      if (error) throw error;

      const { data: pmsdata, error: pmserror } = await supabase
        .from('pmsticket_master')
        .select('*');

      if (pmserror) throw pmserror;

      const assignedTickets = data.filter(
        (ticket) => ticket[toFilter] === user_name
      );

      const assignedpmsTickets = pmsdata.filter(
        (pmsticket) => pmsticket[topmsFilter] === user_name
      );

      // ── PMS notifications ──
      if (user.emp_tier === 'helpdesk') {
        const notifiedPMSTickets = assignedpmsTickets.filter(
          (ticket) => ticket.is_notifiedhd === '1'
        );
        setPMSNotifContent(notifiedPMSTickets.map((t) => t.pmsticket_id));
        setPMSNotificationCount(notifiedPMSTickets.length);
      } else if (user.emp_tier === 'user') {
        const notifiedPMSTickets = assignedpmsTickets.filter(
          (ticket) => ticket.is_notified === '1'
        );
        setPMSNotifContent(notifiedPMSTickets.map((t) => t.pmsticket_id));
        setPMSNotificationCount(notifiedPMSTickets.length);
      }

      // ── Ticket notifications ──
      if (user.emp_tier === 'helpdesk') {
        const notifiedTickets = assignedTickets.filter(
          (ticket) => ticket.is_notifiedhd === true
        );
        setNotifContent(notifiedTickets.map((t) => t.ticket_id));
        setNotificationCount(notifiedTickets.length);
      } else if (user.emp_tier === 'user') {
        const notifiedTickets = assignedTickets.filter(
          (ticket) => ticket.is_notified === true
        );
        setNotifContent(notifiedTickets.map((t) => t.ticket_id));
        setNotificationCount(notifiedTickets.length);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
      setNotificationCount(0);
      setNotifContent([]);
      setPMSNotificationCount(0);
      setPMSNotifContent([]);
    }
  };

  useEffect(() => {
    if (!toFilter || !userData.user_name) return;

    fetchNotifications(userData.user_name);

    const interval = setInterval(() => {
      fetchNotifications(userData.user_name);
    }, 200);

    return () => clearInterval(interval);
  }, [toFilter, userData]);

  useEffect(() => {
    setFinale(pmsnotificationCount + notificationCount);
  }, [pmsnotificationCount, notificationCount]);

  const HandleLogOut = () => {
    localStorage.removeItem('user');
    window.location.replace('/');
  };

  const HandleProfile = () => {
    navigate('/profile');
  };

  const HandleView = async (context) => {
    const params = new URLSearchParams({ id: context });

    if (userData.emp_tier === 'helpdesk') {
      // ✅ Correct Supabase update syntax
      const { error } = await supabase
        .from('ticket_master')
        .update({ is_notifiedhd: false })
        .eq('ticket_id', context);

      if (!error) window.location.replace(`/view-hd-ticket?${params.toString()}`);
    } else if (userData.emp_tier === 'user') {
      const { error } = await supabase
        .from('ticket_master')
        .update({ is_notified: false })
        .eq('ticket_id', context);

      if (!error) window.location.replace(`/view-ticket?${params.toString()}`);
    }
  };

  const HandlePMSView = async (context) => {
    const params = new URLSearchParams({ id: context });

    if (userData.emp_tier === 'helpdesk') {
      const { error } = await supabase
        .from('pmsticket_master')
        .update({ is_notifiedhd: false })
        .eq('pmsticket_id', context);

      if (!error) window.location.replace(`/view-pms-hd-ticket?${params.toString()}`);
    } else if (userData.emp_tier === 'user') {
      const { error } = await supabase
        .from('pmsticket_master')
        .update({ is_notified: false })
        .eq('pmsticket_id', context);

      if (!error) window.location.replace(`/view-pms-user-ticket?${params.toString()}`);
    }
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown>
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
            <FeatherIcon icon="bell" />
            {finale > 0 && (
              <Badge bg="danger" pill style={{ position: 'absolute', top: 8, right: 8 }}>
                {finale}
              </Badge>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
            <Dropdown.Item>
              {notifContent.length === 0 && pmsnotifContent.length === 0 ? ( // ✅ fixed: was === 0 on array
                'No new notifications'
              ) : (
                <div style={{ fontSize: '15px', color: '#333' }}>
                  {notifContent.map((content, index) => (
                    <div
                      key={index}
                      style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid #eee' }}
                      onClick={() => HandleView(content)}
                    >
                      <span className="text-muted">
                        New Notification from Ticket ID: {content}
                      </span>
                    </div>
                  ))}
                  {pmsnotifContent.map((content, index) => (
                    <div
                      key={index}
                      style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid #eee' }}
                      onClick={() => HandlePMSView(content)}
                    >
                      <span className="text-muted">
                        New Notification from PMS Ticket ID: {content}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>

      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown className="drp-user">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 user-name">
            <img src={avatar2} alt="userimage" className="user-avatar" />
            <span>
              <span className="user-name">{name}</span>
              <span className="user-desc">{position}</span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
            <Link to="#" className="dropdown-item" onClick={HandleProfile}>
              <i className="feather icon-user" /> Profile
            </Link>
            <Link to="#" className="dropdown-item" onClick={HandleLogOut}>
              <i className="material-icons-two-tone">chrome_reader_mode</i> Logout
            </Link>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}