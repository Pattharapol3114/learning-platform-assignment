import { Component } from "react";
import SubmissionFallback from "./SubmissionFallback";

// Last line of defence: if Team 06 sends data that crashes rendering,
// contain it here so the rest of the Assignment Detail page stays up.
export default class SubmissionErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[SubmissionList] render failed:", error, info.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <SubmissionFallback reason={this.state.error.message} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
