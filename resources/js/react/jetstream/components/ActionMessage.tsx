import { Transition } from '@pckg/@headlessui/react';
import React, { PropsWithChildren } from '@pckg/preact/compat';

interface Props {
  on: boolean;
  className?: string;
}

export default function ActionMessage({
  on,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className={className}>
      <Transition
        show={on}
        leave="transition ease-in duration-1000"
        leave-from-class="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="text-sm text-gray-600">{children}</div>
      </Transition>
    </div>
  );
}
