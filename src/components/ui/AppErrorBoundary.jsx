import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-cream px-4">
          <div className="max-w-md text-center">
            <h1 className=" text-2xl font-bold text-ink">
              Something Went Wrong
            </h1>
            <p className="mt-2  text-sm text-muted">
              We Hit an Unexpected Issue While Rendering This Page.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 rounded bg-ink px-5 py-2  text-sm font-semibold text-white"
            >
              Reload
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
