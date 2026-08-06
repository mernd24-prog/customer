import React from 'react';
import StickySidebarLayout from "../../../components/common/layouts/StickySidebarLayout";

function OrderDetailLayout({ children }) {
  const childrenArray = React.Children.toArray(children);
  const mainContent = childrenArray[0];
  const sidebarContent = childrenArray.slice(1);

  return (
    <StickySidebarLayout
      sidebarPosition="right"
      containerClass="flex flex-col lg:flex-row gap-4 md:gap-6 xl:gap-8"
      sidebarClass="w-full lg:w-[340px] xl:w-[380px] 2xl:w-[420px]"
      mainContent={mainContent}
      sidebarContent={sidebarContent}
    />
  );
}

function OrderDetailAside({ children, className = "" }) {
  const cleanClassName = className.replace(/xl:sticky\s+|xl:top-\w+\s+|xl:self-start\s+/g, '');
  return (
    <aside className={`grid gap-4 w-full ${cleanClassName}`}>{children}</aside>
  );
}

export { OrderDetailAside };
export default OrderDetailLayout;
