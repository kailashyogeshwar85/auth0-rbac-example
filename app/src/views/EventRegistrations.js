import React, { useEffect, useState } from 'react';
import { Container, Col, Row, ListGroup, ListGroupItem, ListGroupItemHeading } from 'reactstrap';
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from '../components/Loading';
import config from "../auth_config.json";
import ListGroupItemText from 'reactstrap/lib/ListGroupItemText';
import ReactMarkdown from 'react-markdown'

const { apiOrigin = "http://localhost:3002" } = config;

export const EventRegistrationComponent = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    console.log('getting registrations')
    const token = await getAccessTokenSilently();
    const response = await fetch(`${apiOrigin}/api/events/registrations?email=${encodeURIComponent(user.email)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    setRegistrations(responseData);
    setLoading(false);
  }

  useEffect(() => {
    fetchRegistrations();
  },[]);

  return (
    <>
      { loading ? <Loading /> : null}
      <Container className="registrations">
        <Row>
          <Col>
            <h1>Registrations</h1>
          </Col>
        </Row>
        <Row>
          <ListGroup false className="event-list">
          {
            registrations.map((registration, idx) => (
                <ListGroupItem key={idx}>
                  <ListGroupItemHeading className="text-primary">
                    {registration.eventDetails[0].name}
                  </ListGroupItemHeading>
                  <ListGroupItemText>
                    <ReactMarkdown allowDangerousHtml>
                      {registration.eventDetails[0].description}
                    </ReactMarkdown>
                  </ListGroupItemText>
                  <ListGroupItemText>
                    Event Date: { registration.eventDetails[0].event_date}
                  </ListGroupItemText>
                </ListGroupItem>
            ))
          }
          </ListGroup>
        </Row>
      </Container>
    </>
  )

}

export default withAuthenticationRequired(EventRegistrationComponent, {
  onRedirecting: () => <Loading />,
});