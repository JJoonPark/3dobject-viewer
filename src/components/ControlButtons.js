import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'rgb(30,30,30)',
    color:'white',
    display: 'flex',
    position: "absolute",
    top: '20%',
    zIndex: 100,
  },
  tabs: {
    // borderRight: `1px solid ${theme.palette.divider}`,
  },
  tab: {
    // width: '50px',
    // height: `${window.innerHeight*0.06}px`,
    minHeight: `${window.innerHeight*0.07}px`,
    fontSize: 'small',
    minWidth: `${window.innerWidth*0.1-10}px`,
  }
}));

export default function ControlButtons(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(-1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        value={value===-1?false:value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
        <Tab className={classes.tab} label="Setup" onClick={()=>props.toggleSetup(0)} {...a11yProps(0)} />
        <Tab className={classes.tab} label="Render" onClick={()=>props.toggleSetup(1)} {...a11yProps(1)} />
        <Tab className={classes.tab} label="Position" onClick={()=>props.toggleSetup(2)} {...a11yProps(2)} />
        <Tab className={classes.tab} label="Rotation" onClick={()=>props.toggleSetup(3)} {...a11yProps(3)} />
        <Tab className={classes.tab} label="Scale" onClick={()=>props.toggleSetup(4)} {...a11yProps(4)} />
      </Tabs>
      {/* <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel>
      <TabPanel value={value} index={4}>
        Item Five
      </TabPanel>
      <TabPanel value={value} index={5}>
        Item Six
      </TabPanel>
      <TabPanel value={value} index={6}>
        Item Seven
      </TabPanel> */}
    </div>
  );
}