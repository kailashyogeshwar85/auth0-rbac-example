import React, { useEffect, useState } from 'react';
import { Container, Col, Row } from 'reactstrap';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from '../components/Loading';
import config from "../auth_config.json";
import Highlight from "../components/Highlight";

const { apiOrigin = "http://localhost:3002" } = config;

const ViewEventComponent = ({ match}) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState([]);

  useEffect(() => {
    async function getEvent() {
      const eventId = match.params.eventId;
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiOrigin}/api/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseData = await response.json();
      setEvent(responseData);
      setLoading(false);
    }
    getEvent();
  });

  return (
    <>
      {
      loading
      ? <Loading/>
      :
      <Container>
          <Row>
            <Col>
              <h2>Event Details</h2>
              <Highlight>{JSON.stringify(event, null, 2)}</Highlight>
            </Col>
          </Row>
      </Container>
      }
    </>
  )
}

export default withAuthenticationRequired(ViewEventComponent, {
  onRedirecting: () => <Loading />,
});