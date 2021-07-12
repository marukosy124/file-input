import React, { useEffect, useRef, useState } from 'react';
// Material UI
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Delete, ExpandMore, Description, Publish } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
// React window
import { FixedSizeList } from 'react-window';

// Material UI styles
const useStyles = makeStyles((theme) => ({
  input: {
    display: 'none',
  },
  dropContainer: {
    backgroundColor: '#e8eaf6',
    padding: '0.7rem',
    height: '20rem',
    marginBottom: '1rem',
    borderRadius: '0.3rem',
    cursor: 'pointer',
  },
  icon: {
    width: '5rem',
    height: '5rem',
    color: theme.palette.primary.dark,
  },
  dropMessage: {
    height: '100%',
    border: `2px dashed ${theme.palette.primary.main}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '0.3rem',
  },
  submitButton: {
    width: '30%',
    marginLeft: '1rem',
  },
  upload: {
    width: '100%',
    margin: '1rem',
    textAlign: 'center',
    '& .MuiBox-root': {
      padding: '0 0.5rem',
    },
  },
  dropzone: {
    border: '1px solid',
    width: '90vw',
    height: '90vh',
    margin: '2vmin',
    padding: '2vmin',
    overflow: 'auto',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  list: {
    listStyleType: 'none',
  },
}));

const FileInput = (props) => {
  // Component styles
  const classes = useStyles();

  const [isUploading, setIsUploading] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.setAttribute('directory', '');
      ref.current.setAttribute('webkitdirectory', '');
      ref.current.setAttribute('mozdirectory', '');
    }
  }, [ref]);

  // Event handlers
  const handleOnChange = (event) => {
    setIsUploading(true);
    const files = Array.from(event.target.files);
    const fileObjects = files.map((file) => ({
      file,
      name: file.webkitRelativePath || file.name,
    }));
    const filteredFileObjects = fileObjects.filter(
      (file) => !props.values.some((value) => value.name === file.name),
    );
    props.onChange(filteredFileObjects);
    event.target.value = null;
    setIsUploading(false);
  };

  const handleOnDrop = async (event) => {
    event.preventDefault();
    // The list of all files within the directory
    const fileEntries = [];
    const queue = [];
    setIsUploading(true);
    // Insert all items into queue
    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) queue.push(entry);
    }
    // Use BFS to iterate all subdirectories
    while (queue.length > 0) {
      const entry = queue.shift();
      if (entry.isFile) {
        fileEntries.push(entry);
      } else if (entry.isDirectory) {
        queue.push(...(await traverseDirectory(entry)));
      }
    }
    // Convert fileEntries to fileObjects
    const fileObjects = await Promise.all(
      fileEntries.map(
        (entry) =>
          new Promise((resolve) =>
            entry.file((file) =>
              resolve({ file, name: entry.fullPath.substring(1) }),
            ),
          ),
      ),
    );
    const filteredFileObjects = fileObjects.filter(
      (file) => !props.values.some((value) => value.name === file.name),
    );
    props.onChange(filteredFileObjects);
    setIsUploading(false);
  };

  const traverseDirectory = async (entry) => {
    const allEntries = [];
    const reader = entry.createReader();
    let entries = await new Promise((resolve) => reader.readEntries(resolve));
    while (entries.length > 0) {
      allEntries.push(...entries);
      entries = await new Promise((resolve) => reader.readEntries(resolve));
    }
    return allEntries;
  };

  // Render React Window List rows
  const Row = ({ data, index, style }) => {
    const item = data.values[index];
    return (
      <ListItem key={index} style={style}>
        <ListItemAvatar>
          <Avatar>
            <Description />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={item.name} />
        <IconButton edge="end" onClick={() => props.onRemove(index)}>
          <Delete />
        </IconButton>
      </ListItem>
    );
  };

  return (
    <>
      <div
        className={classes.dropContainer}
        onClick={() => ref.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
        onDrop={handleOnDrop}
      >
        <div className={classes.dropMessage}>
          {isUploading ? (
            <CircularProgress />
          ) : (
            <>
              <Publish className={classes.icon} />
              <Typography variant="body1" align="center">
                Drop or click to select directory or file(s)
              </Typography>
            </>
          )}
        </div>
        <input
          ref={ref}
          className={classes.input}
          type="file"
          onChange={handleOnChange}
        />
      </div>
      {props.values?.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography className={classes.heading}>
                {props.values?.length} files selected
              </Typography>
              <Button color="secondary" onClick={() => props.onClear()}>
                Clear All
              </Button>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <FixedSizeList
              className={classes.list}
              height={250}
              width="100%"
              itemCount={props.values?.length}
              itemSize={60}
              itemData={{ values: props.values }}
            >
              {Row}
            </FixedSizeList>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default FileInput;
