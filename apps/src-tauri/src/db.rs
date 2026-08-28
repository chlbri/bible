use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct DatabaseState {
    pub reader_conn: Mutex<Connection>,
    pub semantic_conn: Mutex<Connection>,
}

impl DatabaseState {
    pub fn new(reader_path: PathBuf, semantic_path: PathBuf) -> Result<Self, rusqlite::Error> {
        let reader_conn = Connection::open(reader_path)?;
        let semantic_conn = Connection::open(semantic_path)?;

        Ok(Self {
            reader_conn: Mutex::new(reader_conn),
            semantic_conn: Mutex::new(semantic_conn),
        })
    }
}
