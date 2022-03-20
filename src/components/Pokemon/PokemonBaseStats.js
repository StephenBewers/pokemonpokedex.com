import React from "react";
import "./PokemonBaseStats.scss";
import ModalRow from "../Modal/ModalRow";
import ModalInfoItem from "../Modal/ModalInfoItem";
import { textCleanup } from "../../utils/pokemonUtils";

const PokemonBaseStats = ({ pokemon }) => {
  const types = pokemon.form?.details?.types?.length
    ? pokemon.form.details.types
    : pokemon.variant.types;
  const stats = pokemon.variant.stats;

  // Gets the sum of all the base stat values
  const getTotalStatsValue = (stats) => {
    let totalStatsValue = 0;
    stats.forEach((stat) => {
      totalStatsValue += stat.base_stat;
    });
    return totalStatsValue;
  };

  const totalStatsValue = getTotalStatsValue(stats);

  // Get the types
  const type1 = types[0].type.name;
  const type2 = types.length > 1 ? types[1].type.name : type1;

  return (
    <ModalRow id="pokemon-base-stats">
      <ModalInfoItem label="Base stats">
        <table className="pokemon-stat-table">
          <caption>The base stats of this pokémon.</caption>
          <thead>
            <tr>
              <th scope="col" className="modal-info-sublabel stat">
                Stat
              </th>
              <th scope="col" className="modal-info-sublabel value">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, i) => {
              if (stat.stat.name.includes("special")) {
                stat.stat.name = stat.stat.name.replace("special", "Sp.");
              }
              return (
                <tr key={`stat-${i}`}>
                  <td className={`stat-name ${stat.stat.name}`}>
                    {textCleanup(stat.stat.name)}
                  </td>
                  <td className="stat-value">
                    <span className="stat-value-number">{stat.base_stat}</span>
                    <span
                      className="stat-bar-outer"
                      style={{
                        paddingRight: 150 - (stat.base_stat / 255) * 150 + "px",
                      }}
                    >
                      <span
                        className={`stat-bar-inner ${type1}`}
                        style={{
                          paddingRight: (stat.base_stat / 255) * 150 + "px",
                        }}
                      ></span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="stat-name total">Total</td>
              <td className="stat-value total">
                <span className="stat-value-number">{totalStatsValue}</span>
                <span
                  className="stat-bar-outer total"
                  style={{
                    paddingRight:
                      150 - (totalStatsValue / 6 / 255) * 150 + "px",
                  }}
                >
                  <span
                    className={`stat-bar-inner total ${type2}`}
                    style={{
                      paddingRight: (totalStatsValue / 6 / 255) * 150 + "px",
                    }}
                  ></span>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </ModalInfoItem>
    </ModalRow>
  );
};

export default PokemonBaseStats;
