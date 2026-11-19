
import React from "react";
import ErrorState from "../../components/ui/feedback/ErrorState";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {}

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="w-full bg-white px-4 py-6">
          <div className="mx-auto w-full max-w-2xl">
            <ErrorState
              title="Something Went Wrong"
              message="We hit an unexpected issue while rendering this page. Please reload and try again."
              actionLabel="Reload"
              onAction={this.handleReload}
            />
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
