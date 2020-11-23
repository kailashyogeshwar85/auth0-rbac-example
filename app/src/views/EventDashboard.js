import React, { useEffect, useState } from 'react';
import { Button , Container, Col, Row, Table, Modal, ModalBody, ModalHeader, ModalFooter, Alert } from 'reactstrap';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from '../components/Loading';
import config from "../auth_config.json";
import TextEditorComponent from '../components/TextEditor';


const { apiOrigin = "http://localhost:3002" } = config;

const EventDashboard = () => {
  const { getAccessTokenSilently, user } = useAuth0();

  // TODO: change it to domain from config
  const namespace = 'https://zebfi.tech/roles'
  const userRole = user[namespace][0];
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editableEvent, setEditableEvent] = useState({});
  const [registeredSuccessfully, setRegisterSuccess] = useState(false);

  const toggle = () => setModal(!modal);

  useEffect(() => {
    fetchEvents();
  },[]);

  const editEvent = (event) => {
    setEditableEvent(event);
    toggle();
  }

  const fetchEvents = async () => {
    const token = await getAccessTokenSilently();
    const response = await fetch(`${apiOrigin}/api/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    setEvents(responseData);
    setLoading(false);
  }

  const saveEvent = async () => {
    const updatedEvent = editableEvent;
    updatedEvent.name = `Event #${Date.now()}`;
    const token = await getAccessTokenSilently();
    setLoading(true);
    const response = await fetch(`${apiOrigin}/api/event/${updatedEvent._id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedEvent),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('updated ', response.json());
    setLoading(false);
    await fetchEvents();
    setEditableEvent({});
    toggle();
  }

  const deleteEvent = (event) => {
    console.log('deleting element ', event);
  }

  const updateDescription = (description) => {
    setEditableEvent(
      {
        ...editableEvent,
        ...{ description }
      }
    )
  }

  const registerEvent = async (event) => {
    setLoading(true);
    console.log('registering for event ', event.name);
    const token = await getAccessTokenSilently();
    const response = await fetch(`${apiOrigin}/api/event/${event._id}`, {
       method: 'POST',
       body: JSON.stringify({
         email: user.email
       }),
       headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json'
       }
     });
    const data = await response.json();
    console.log('registered ', data);
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
    }, 1000);
    setLoading(false);
  }

  return (
    <>
      { loading ? <Loading /> : null }
      { registeredSuccessfully ? <Alert color="success">Registered Successfully</Alert>: null }
      <Container className="dashboard">
      <Row>
        <Col>
            <h2>Events Dashboard </h2>
        </Col>
      </Row>
      <Row>
          <Col>
            <Button color="primary">
              Create Event
            </Button>
          </Col>
      </Row>
      <Row >
        <Table borderless>
          <thead>
            <tr>
              <th>
                #
              </th>
              <th>
                Event Name
              </th>
              <th>
                Event Time
              </th>
              <th>
                  Actions
              </th>
            </tr>
          </thead>
          <tbody>
              {
                events.map((el, idx) => (
                  <tr key={idx}>
                    <th scope="row">{++idx}</th>
                    <td>
                      <a href={'/view/' + el._id}>
                        {el.name}
                      </a>
                    </td>
                    <td>{el.event_date}</td>
                    <td>
                      {
                        (userRole === 'Organizer')
                        ? <>
                            <Button color="primary" size="md" onClick={ () => editEvent(el) }>Edit</Button>{' '}
                            <Button color="danger" size="md" onClick={ () => deleteEvent(el) }>Delete</Button>{' '}
                          </>
                        : <>
                            <Button color="primary" size="md" onClick={ () => registerEvent(el)}>Register</Button>{' '}
                          </>
                      }
                    </td>
                  </tr>
                ))
              }
          </tbody>
        </Table>
      </Row>
      </Container>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{editableEvent.name}</ModalHeader>
        <ModalBody>
          <TextEditorComponent
            value={editableEvent.description}
            handleChange={updateDescription}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={saveEvent}>Update</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  )
}


export default withAuthenticationRequired(EventDashboard, {
  onRedirecting: () => <Loading />,
});