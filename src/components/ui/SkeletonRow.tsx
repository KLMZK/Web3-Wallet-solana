import { FC } from 'react';

const SkeletonRow: FC = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-white/[0.06] shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3.5 w-[35%] rounded-md bg-white/[0.06]" />
        <div className="h-3 w-[20%] rounded-md bg-white/[0.04]" />
      </div>
      <div className="h-3.5 w-[60px] rounded-md bg-white/[0.06]" />
    </div>
  );
};

export default SkeletonRow;
