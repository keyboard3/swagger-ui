import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"
import cx from "classnames"
import randomBytes from "randombytes"
import { RouteContext } from "../context"
import { stringify } from "core/utils"

export default class ModelExample extends React.Component {

  static contextType = RouteContext
  static propTypes = {
    getComponent: PropTypes.func.isRequired,
    specSelectors: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    example: PropTypes.any.isRequired,
    isExecute: PropTypes.bool,
    getConfigs: PropTypes.func.isRequired,
    specPath: ImPropTypes.list.isRequired,
    includeReadOnly: PropTypes.bool,
    includeWriteOnly: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context)
    let { getConfigs, isExecute } = this.props
    let { defaultModelRendering } = getConfigs()

    let activeTab = defaultModelRendering

    if (defaultModelRendering !== "example" && defaultModelRendering !== "model") {
      activeTab = "example"
    }

    if (isExecute) {
      activeTab = "example"
    }

    this.state = {
      activeTab,
      mockDataValue: context.sampleResponse
    }
  }
  handleOnChange = (e) => {
    this.setState({ mockDataValue: e.target.value })
  }

  componentDidMount() {
    this.getMockData();
  }

  getMockData() {
    fetch("http://127.0.0.1:3000/api/get-mock-data", {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        path: this.context.path,
        method: this.context.method,
      })
    }).then(res => res.json())
      .then(result => {
        if (!result) return null;
        this.setState({ mockDataValue: result.mockDataValue })
      })
      .catch(err=>{
        console.error(err)
      })
  }

  saveMockdata() {
    fetch("http://127.0.0.1:3000/api/save-mock-data", {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        path: this.context.path,
        method: this.context.method,
        mockDataValue: this.state.mockDataValue
      })
    })

  }

  activeTab = (e) => {
    let { target: { dataset: { name } } } = e

    this.setState({
      activeTab: name
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.isExecute &&
      !this.props.isExecute &&
      this.props.example
    ) {
      this.setState({ activeTab: "example" })
    }
  }

  render() {
    let { getComponent, specSelectors, schema, example, isExecute, getConfigs, specPath, includeReadOnly, includeWriteOnly } = this.props
    let { defaultModelExpandDepth } = getConfigs()
    const ModelWrapper = getComponent("ModelWrapper")
    const HighlightCode = getComponent("highlightCode")
    const exampleTabId = randomBytes(5).toString("base64")
    const examplePanelId = randomBytes(5).toString("base64")
    const modelTabId = randomBytes(5).toString("base64")
    const modelPanelId = randomBytes(5).toString("base64")
    const TextArea = getComponent("TextArea")
    let isOAS3 = specSelectors.isOAS3()

    return (
      <div className="model-example">
        <ul className="tab" role="tablist">
          <li className={cx("tabitem", { active: this.state.activeTab === "example" })} role="presentation">
            <button
              aria-controls={examplePanelId}
              aria-selected={this.state.activeTab === "example"}
              className="tablinks"
              data-name="example"
              id={exampleTabId}
              onClick={this.activeTab}
              role="tab"
            >
              {isExecute ? "Edit Value" : "Example Value"}
            </button>
          </li>
          {schema && (
            <li className={cx("tabitem", { active: this.state.activeTab === "model" })} role="presentation">
              <button
                aria-controls={modelPanelId}
                aria-selected={this.state.activeTab === "model"}
                className={cx("tablinks", { inactive: isExecute })}
                data-name="model"
                id={modelTabId}
                onClick={this.activeTab}
                role="tab"
              >
                {isOAS3 ? "Schema" : "Model"}
              </button>
            </li>
          )}
          <li className={cx("tabitem", { active: this.state.activeTab === "mockData" })} role="presentation">
            <button
              aria-controls={""}
              aria-selected={this.state.activeTab === "mockData"}
              className="tablinks"
              data-name="mockData"
              id={"mockData Id"}
              onClick={this.activeTab}
              role="tab"
            >
              mock data
            </button>
            <button onClick={this.saveMockdata.bind(this)}>
              保存
            </button>
          </li>
        </ul>
        {this.state.activeTab === "example" && (
          <div
            aria-hidden={this.state.activeTab !== "example"}
            aria-labelledby={exampleTabId}
            data-name="examplePanel"
            id={examplePanelId}
            role="tabpanel"
            tabIndex="0"
          >
            {example ? example : (
              <HighlightCode value="(no example available)" getConfigs={getConfigs} />
            )}
          </div>
        )}

        {this.state.activeTab === "model" && (
          <div
            aria-hidden={this.state.activeTab === "example"}
            aria-labelledby={modelTabId}
            data-name="modelPanel"
            id={modelPanelId}
            role="tabpanel"
            tabIndex="0"
          >
            <ModelWrapper
              schema={schema}
              getComponent={getComponent}
              getConfigs={getConfigs}
              specSelectors={specSelectors}
              expandDepth={defaultModelExpandDepth}
              specPath={specPath}
              includeReadOnly={includeReadOnly}
              includeWriteOnly={includeWriteOnly}
            />
          </div>
        )}
        {
          this.state.activeTab == "mockData" && (
            <TextArea className={"body-param__text"} value={stringify(this.state.mockDataValue)} onChange={this.handleOnChange} />
          )
        }
      </div>
    )
  }

}
