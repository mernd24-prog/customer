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
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#FAF6EE] px-4">
          <div className="max-w-md text-center">
            <h1 className="font-montserrat text-2xl font-bold text-[#2E2E2E]">
              Something went wrong
            </h1>
            <p className="mt-2 font-montserrat text-sm text-[#787878]">
              We hit an unexpected issue while rendering this page.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 rounded bg-[#2E2E2E] px-5 py-2 font-montserrat text-sm font-semibold text-white"
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
