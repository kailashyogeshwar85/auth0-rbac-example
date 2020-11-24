import React, { useEffect, useState } from 'react';
import { Container, Col, Row, Alert, Button } from 'reactstrap';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from '../components/Loading';
import config from '../auth_config.json';

const { apiOrigin = 'http://localhost:3002' } = config;

const AccountSettingsView = () => {
  const { user, getAccessTokenWithPopup, logout } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [apiError, setAPIError] = useState(false);

  const [deactivated, setDeactivated] = useState(false);

  const deactivateAccount = async () => {
    const deactivateToken = await getAccessTokenWithPopup({
      audience: apiOrigin,
      scope: 'account:deactivate'
    });
    setLoading(true);
    const response = await fetch(`${apiOrigin}/api/account/deactivate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deactivateToken}`
      },
      body: JSON.stringify({ email: user.email })
    });
    if (response.status === 403) {
      let msg = await response.text();
      setAPIError(msg);
      setLoading(false);
      return;
    }
    const rD = await response.json();
    setAPIError(false);
    setLoading(false);
    setDeactivated(true);
    logout();
  }

  const enableTransaction = async () => {
    const token = await getAccessTokenWithPopup({
      audience: apiOrigin,
      scope: 'transactions:enable'
    });
    setLoading(true);

    const response = await fetch(`${apiOrigin}/api/transactions/enable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email: user.email })
    });
    if (response.status === 403) {
      let msg = await response.text();
      setAPIError(msg);
      setLoading(false);
      return;
    }
    const rD = await response.json();
    setAPIError(false);
    setLoading(false);
  }

  return (
    <>
      { loading ? <Loading/> : null }

      <Container className="settings">
        <Row>
          <Col>
          { apiError
              ? <Alert color="warning">{apiError} </Alert>
              : null
          }
          { !deactivated
            ?
            <Alert color="danger">
              Danger Zone: DeActivated account cannot be recovered for 7 days.
            </Alert>
            :
            <Alert>
              Account Deactivated Successfully. See you soon.
            </Alert>
          }
          <Button color="danger" onClick={deactivateAccount}>Deactivate</Button>


          </Col>
        </Row>
        <Row>
          <Col>
            <h4 className="text-success">Transaction Settings</h4>
            <Button color="primary" onClick={enableTransaction}>Enable Transactions </Button>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default withAuthenticationRequired(AccountSettingsView, {
  onRedirecting: () => <Loading />,
});