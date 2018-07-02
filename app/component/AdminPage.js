import PropTypes from 'prop-types';
import React from 'react';
import AdminForm from './AdminForm';

class AdminPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  state = { loading: true, dataConDefaults: {}, modeWeight: {} };

  componentDidMount() {
    const flattenModeWeight = (modeWeights) => {
      console.log(modeWeights);
      for (let weight in modeWeights) {
        modeWeights[`${weight.toLowerCase()}Weight`] = modeWeights[weight];
        delete modeWeights[weight];
      }
      return modeWeights;
    }

    const OTPURLSplit = this.context.config.URL.OTP.split('/');
    const dataContainerURL = `${
      this.context.config.URL.API_URL
    }/routing-data/v2/${
      OTPURLSplit[OTPURLSplit.length - 2]
    }/router-config.json`;
    fetch(dataContainerURL)
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            loading: false,
            dataConDefaults: result.routingDefaults,
            modeWeightDefaults: result.modeWeight !== undefined
              ? flattenModeWeight(result.modeWeight)
              : {},
          });
        },
        err => {
          console.log(err);
          this.setState({ loading: false });
        },
      );
  }

  render() {
    return <AdminForm {...this.state} />;
  }
}

export default AdminPage;
