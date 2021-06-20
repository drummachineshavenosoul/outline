// @flow
import { Table, TBody, TR, TD } from "oy-vey";
import * as React from "react";
import theme from "../../../shared/styles/theme";

type Props = {|
  children: React.Node,
|};

export default (props: Props) => (
  <Table width="550" padding="40">
    <TBody>
      <TR>
        <TD align="left">{props.children}</TD>
      </TR>
    </TBody>
  </Table>
);

export const baseStyles = `
  #__bodyTable__ {
    font-family: ${theme.fontFamily};
    font-size: 16px;
    line-height: 1.5;
  }

  ins {
    background-color: #128a2929;
    text-decoration: none;
  }

  del {
    background-color: ${theme.slateLight};
    color: ${theme.slate};
    text-decoration: strikethrough;
  }
`;
