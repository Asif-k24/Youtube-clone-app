import React from "react";
import AllVideoCardGrid from "../../features/video/AllVideoCardGrid";
import SearchInput from "../../features/search/SearchInput";

const Explore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 to-slate-800">
      <SearchInput />
      <AllVideoCardGrid />
    </div>
  );
};

export default Explore;
