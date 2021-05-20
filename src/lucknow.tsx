import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { CenterInterface } from "./interface/center";
import * as _ from "lodash";
import { min } from "lodash";

const Lucknow: React.FC = () => {
  const [available, setAvailable] = useState<CenterInterface[]>([]);
  const [under45, setUnder45] = useState<CenterInterface[]>([]);
  const [index, setIndex] = useState(0);
  const age = 18;
  useLayoutEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => loadData(), 120000);
    return () => clearInterval(intervalId);
  });
  const loadData = async () => {
    const date = new Date();
    const todaysDate =
      String(date.getDate()).padStart(2, "0") +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      date.getFullYear();
    const res = await axios.get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=670&date=${todaysDate}`
    );
    setAvailable(res.data.centers);
    const local: CenterInterface[] = res.data.centers;
    var under45Available: CenterInterface[] = [];
    local.forEach((i) => {
      i.sessions?.forEach((j) => {
        if (j.min_age_limit === age && j.available_capacity > 0) {
          under45Available.push(i);
        }
      });
    });
    console.log(_.isEqual(under45Available, under45));
    if (!_.isEqual(under45Available, under45)) {
      setUnder45(under45Available);
      var under45Message = [];
      for (var i = 0; i < under45Available.length; i++) {
        var message = "";
        // var sessionLength = under45Available[i].sessions?.length;
        var vaccine;
        message += `Name : ${under45Available[i].address}\n`;
        message += `Address : ${under45Available[i].name}\n`;
        message += `block name : ${under45Available[i].block_name}\n`;
        message += `pincode : ${under45Available[i].pincode}\n`;
        // if (sessionLength != undefined) {
        // for (var j = 0; j < sessionLength; j++) {
        under45Available[i].sessions?.some((k) => k.vaccine);
        under45Available[i].sessions?.forEach((j) => {
          if (j.available_capacity > 0) {
            message += `available_capacity : ${j.available_capacity}\n`;
            message += `date : ${j.date}\n`;
            vaccine = j.vaccine;
          }
        });
        message += `vaccine : ${vaccine}\n`;
        under45Message.push(message);
      }
      // console.log(under45Message);
      for (var i = 0; i < under45Message.length; i += 10) {
        var message = "";
        for (var j = i; j < i + Math.min(under45Message.length - i, 10); j++) {
          message += under45Message[j] + "\n";
        }
        const res = await axios.post(
          `https://api.telegram.org/bot1829403855:AAGaP3nP51Fs-J87c4Nsd9syhm2Ycq2cMK0/sendMessage?chat_id=-1001327148744&text=${encodeURIComponent(
            message
          )}`
        );
        console.log(res);
      }

      // }
      // }
      // under45Available.forEach(async (i) => {
      //   const res = await axios.post(
      //     `https://api.telegram.org/bot1829403855:AAGaP3nP51Fs-J87c4Nsd9syhm2Ycq2cMK0/sendMessage?chat_id=-459616282&text=${encodeURIComponent(
      //       `Name : ${i.name}\nAddress : ${i.address}\nPin Code : ${
      //         i.pincode
      //       }\n${i.sessions?.forEach(
      //         (j) =>
      //           `Date : ${j.date}, Available : ${j.available_capacity}\nVaccine : ${j.vaccine}`
      //       )}`
      //     )}`
      //   );
      // });
    }
    setIndex(index + 1);
  };
  return (
    <div>
      <p>{under45[0]?.name}</p>
      <ul>
        {available.map(({ name, block_name, pincode, sessions }, index) => {
          return sessions?.some(
            (item) => item.min_age_limit === age && item.available_capacity > 0
          ) ? (
            <li key={index}>
              <ul>
                <li>{name}</li>
                <li>{block_name}</li>
                <li>{pincode}</li>
                <ol>
                  {sessions?.map(
                    ({ date, available_capacity, min_age_limit }, index) => {
                      return (
                        <li key={index}>
                          <ul>
                            <li>date - {date}</li>
                            <li>available_capacity - {available_capacity}</li>
                            <li>min_age_limit - {min_age_limit}</li>
                          </ul>
                        </li>
                      );
                    }
                  )}
                </ol>
              </ul>
              <br />
            </li>
          ) : (
            ""
          );
        })}
      </ul>
    </div>
  );
};
export default Lucknow;
