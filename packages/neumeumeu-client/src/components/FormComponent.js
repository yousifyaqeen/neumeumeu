import { Component } from "react";

export default class FormComponent extends Component {
  onChange = stateProp => e => this.setState({ [stateProp]: e.target.value });

  onCheckboxChange = stateProp => e =>
    this.setState({ [stateProp]: e.target.checked });
}
