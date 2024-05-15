import cx from "../../lib/cx";

const BarPokemon = ({ name, lvl, className }) => {
  return (
    <div className={cx("bg-[#fafcdc] w-[180px] pl-3 pt-1 pb-1 pr-2 font-nova inline-flex flex-col font-bold border-[#262e0c] border-[3px] rounded-[8px] rounded-tl-[14px] rounded-br-[14px]", className)}>
      <div className="flex justify-between">
        <div className="flex text-[13px] items-center">
          {name}
          <img
            src="/newpokemon/icons/mars.svg"
            alt="mars"
            className="w-3 rotate-[-45deg]"
          />
        </div>
        <div>Lv{lvl}</div>        
      </div>
      <div className="flex justify-between mr-[-5px]">
          <img
           src="/newpokemon/icons/pokeball.svg"
           alt="pokeball"
           className="w-4"
          />
          <div className="flex items-center rounded-full overflow-hidden bg-[black] pr-0.5">
            <div className="text-[orange] text-[9px] px-1">
              HP
            </div>
            <div className="w-[100px] h-2.5 bg-[#6fd697] border-[white] border-2 rounded-[20px]">

            </div>
          </div>
        </div>
    </div>
  );
};

export default BarPokemon;
